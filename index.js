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

// ==================== WEEK 9 ========================
app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

const midtransClient = require('midtrans-client');

let midtransCore = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: '***', // hrs daftar dulu
    clientKey: '***'
});
// ====================================================

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.get("/", async function (req, res) {
    return res.status(200).send({
        "msg": "Hello World!"
    });
});

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

async function getBill(req){
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
    else if (req.user.plan == 2) {
        bill.bill = 1000;
    }

    return res.status(200).send(bill);
}

app.get("/api/bill/", authenticate, async function (req, res) {
    const bill = await getBill(req);

    return res.status(200).send(bill);
});

// app.get("/api/pay/", authenticate, async function (req, res) {
//     if (req.user.plan == 0) {
//         return res.status(403).send({
//             "msg": "endpoint ini hanya untuk subscriber!"
//         });
//     }
//     let hasil = await executeQuery(req.conn, `update apikey set last_paid = now() where apikey = '${req.user.apikey}'`);
//     return res.status(200).send({
//         "msg": "successfully paid!"
//     });
// });

app.post("/api/pay/cc", authenticate, async function (req, res) {
    const card = {
        'card_number': req.body.card_number,//'5264 2210 3887 4659',
        'card_exp_month': req.body.card_exp_month,//'12',
        'card_exp_year': req.body.card_exp_year,//'2025',
        'card_cvv': req.body.card_cvv,//'123',
        'client_key': midtransCore.apiConfig.clientKey,
    };
    const cardToken = await midtransCore.cardToken(card);
    const bill = await getBill(req);
    const parameter = {
        "payment_type": "credit_card",
        "transaction_details": {
            "gross_amount": bill.bill,
            "order_id": "t" + new Date().getTime(),
        },
        "credit_card":{
            "token_id": cardToken.token_id
        }
    };
    const chargeResponse = await midtransCore.charge(parameter);
    console.log(chargeResponse);

    if(chargeResponse.fraud_status == "accept"){
        let hasil = await executeQuery(req.conn, `update apikey set last_paid = now() where apikey = '${req.user.apikey}'`);
        req.conn.release();
        return res.status(200).send({
            "msg": "successfully paid!"
        });
    }
    else{
        req.conn.release();
        return res.status(400).send({
            "msg": "Fraud detected!"
        });
    }
});

app.get("/api/pay/bank", authenticate, async function (req, res) {
    if (req.user.plan == 0) {
        return res.status(403).send({
            "msg": "endpoint ini hanya untuk subscriber!"
        });
    }
    const bill = await getBill(req);
    const parameter = {
        "payment_type": "bank_transfer",
        "transaction_details": {
            "gross_amount": bill.bill,
            "order_id": "t" + new Date().getTime(),
        },
        "bank_transfer": {
            "bank": "bca"
        }
    };
    const chargeResponse = await midtransCore.charge(parameter);
    console.log(chargeResponse);
    // let hasil = await executeQuery(req.conn, `update apikey set last_paid = now() where apikey = '${req.user.apikey}'`);
    return res.status(200).send({
        "msg": `mohon transfer ke : ${chargeResponse.va_numbers[0].va_number}`
    });
});

app.post("/api/midtrans-notif", async function (req, res) {
    console.log(req.body);
    return res.status(200).send("");
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`listening on port ${port}`);
})
// =======================================================================

// =======================================================================
// const express = require("express");
// const app = express();
// const morgan = require("morgan");
// const {
//     authenticate,
//     rateLimit,
//     checkPayment,
//     authorize,
//     checkQuota,
//     logger,
// } = require("./middlewares");
// const {
//     executeQuery
// } = require("./utils");

// app.use(morgan("combined"));


// app.get("/api/tambah/", [authenticate, rateLimit, checkPayment, checkQuota, logger], async function (req, res) {
//     req.conn.release();
//     return res.status(200).send({
//         "hasil": parseInt(req.query.a) + parseInt(req.query.b)
//     });
// });

// app.get("/api/tambah-premium/", [authenticate, authorize, checkPayment, checkQuota, logger], async function (req, res) {
//     req.conn.release();
//     return res.status(200).send({
//         "hasil": parseInt(req.query.a) + parseInt(req.query.b)
//     });
// });

// app.get("/api/bill/", [authenticate, authorize], async function (req, res) {
//     let bill = {
//         "bill": 0
//     };
//     if (req.apikey.plan == 2 || req.apikey.plan == 3) {
//         bill.bill = 1000;
//     };
//     if (req.apikey.last_paid) {
//         let result = await executeQuery(req.conn, `select count(*) as n from access_log where apikey = '${req.apikey.apikey}' and accessed_at < now() and accessed_at > '${req.apikey.last}'`);
//         let usage = result[0].n;
//         if (req.apikey.plan == 1) {
//             bill.bill = 100 * usage;
//         } else if (req.apikey.plan == 3) {
//             bill.bill += 100 * (usage - 20);
//         }
//     }
//     req.conn.release();
//     return res.status(200).send(bill);
// });

// app.get("/api/pay/", [authenticate, authorize], async function (req, res) {
//     let result = await executeQuery(req.conn, `update apikey set last_paid = now() where apikey = '${req.apikey.apikey}'`);
//     req.conn.release();
//     return res.status(200).send({
//         "msg": "successfully paid!"
//     });
// });

// app.listen(3000, function () {
//     console.log('listening on port 3000');
// })