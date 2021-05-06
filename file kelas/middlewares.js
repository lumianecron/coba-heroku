const {
    getConnection,
    executeQuery
} = require("./utils");

module.exports = {
    authenticate: async function (req, res, next) {
        //cek api key dikirim atau tidak
        if (!req.query.apikey) {
            return res.status(401).send({
                "msg": "api key tidak ditemukan! :("
            });
        }

        //cek api key terdaftar atau tidak
        req.conn = await getConnection();
        let hasil = await executeQuery(req.conn, `select *, DATE_FORMAT(last_paid, "%Y-%m-%d %H:%i:%s+07:00") as pembayaran_terakhir from apikey where apikey = '${req.query.apikey}'`);
        if (hasil.length <= 0) {
            req.conn.release();
            return res.status(400).send({
                "msg": "api key tidak terdaftar! :("
            });
        }

        //kalau terdaftar, simpan datanya di sebuah variabel
        req.user = hasil[0];
        next();
    },
    rateLimit: async function (req, res, next) {
        //cek, untuk user free kalau dalam rentang waktu 1 menit ini sudah akses > 10 kali maka blokir
        if (req.user.plan == 0) {
            hasil = await executeQuery(req.conn, `select count(*) as n from access_log where apikey = '${req.query.apikey}' and accessed_at > now() - interval 1 minute`);
            let banyakAkses = hasil[0].n;
            if (banyakAkses > 10) {
                req.conn.release();
                return res.status(429).send({
                    "msg": "anda telah mengakses melebihi batas! :("
                });
            }
        }
        next();
    },
    cekTunggakan: function (req, res, next) {
        if([1, 2, 3].includes(req.user.plan)){
            if(req.user.pembayaran_terakhir){
                let terakhir_bayar = new Date(req.user.pembayaran_terakhir);
                let sekarang = new Date();
                console.log("A");
                console.log(req.user.pembayaran_terakhir);
                console.log(terakhir_bayar);
                console.log(sekarang);
                if(sekarang - terakhir_bayar > 2 * 60 * 1000){
                    req.conn.release();
                    return res.status(402).send({
                        "msg": "Anda belum bayar :("
                    });
                }
                else{
                    next();
                }
            }
            else{
                console.log("B");
                req.conn.release();
                return res.status(402).send({
                    "msg": "Anda belum bayar :("
                });
            }
        }
        else{
            next();
        }
    },
    logDb: async function (req, res, next) {
        //catat log bahwa api key ini mengakses endpoint /api/tambah
        hasil = await executeQuery(req.conn, `insert into access_log values (0, '${req.query.apikey}', '${req.path}', '${req.url}', now())`);
        next();
    }
}