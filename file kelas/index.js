const express = require("express");
const app = express();
const morgan = require("morgan");
const {
    authenticate,
    rateLimit,
    logDb,
    cekTunggakan,
} = require("./middlewares");
const {
    getConnection,
    executeQuery
} = require("./utils");

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.get("/api/tambah/", [authenticate, rateLimit, cekTunggakan, logDb], async function (req, res) {
    req.conn.release();
    return res.status(200).send({
        "hasil": parseInt(req.query.a) + parseInt(req.query.b)
    });
});

app.get("/api/tambah-premium/", async function (req, res) {
    return res.status(200).send({
        "hasil": parseInt(req.query.a) + parseInt(req.query.b)
    });
});

app.get("/api/bill/", authenticate, async function (req, res) {
    let bill = {
        "bill": 0
    };
    if (req.user.plan == 1) {
        if(req.user.pembayaran_terakhir){
            let hasil = await executeQuery(req.conn, `select count(*) as n from access_log where apikey = '${req.user.apikey}' and accessed_at > '${req.user.pembayaran_terakhir}'`);
            let jumlah_akses = hasil[0].n;
            bill.bill = 100 * jumlah_akses;
        }
    }

    return res.status(200).send(bill);
});

app.get("/api/pay/", authenticate, async function (req, res) {
    if (req.user.plan == 0) {
        return res.status(403).send({
            "msg": "endpoint ini hanya untuk subscriber!"
        });
    }
    let hasil = await executeQuery(req.conn, `update apikey set last_paid = now() where apikey = '${req.user.apikey}'`);
    return res.status(200).send({
        "msg": "successfully paid!"
    });
});

app.listen(3000, function () {
    console.log('listening on port 3000');
})