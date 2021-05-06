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
    cekQuota: async function (req, res, next) {
        hasil = await executeQuery(req.conn, `select count(*) as n from access_log where apikey = '${req.query.apikey}' and accessed_at > '${req.user.pembayaran_terakhir}'`);
        let banyakAkses = hasil[0].n;
        if (banyakAkses > 20) {
            req.conn.release();
            return res.status(402).send({
                "msg": "quota anda sudah habis! :("
            });
        }
    },
    logDb: async function (req, res, next) {
        //catat log bahwa api key ini mengakses endpoint /api/tambah
        hasil = await executeQuery(req.conn, `insert into access_log values (0, '${req.query.apikey}', '${req.path}', '${req.url}', now())`);
        next();
    }
}
// =======================================================================

// =======================================================================
// const {
//     getConnection,
//     executeQuery
// } = require("./utils");

// async function authenticate(req, res, next) {
//     console.log("Authenticate");
//     if (req.query.apikey) {
//         console.log("1");
//         req.conn = await getConnection();
//         console.log("2");
//         let result = await executeQuery(req.conn, `select apikey, plan, DATE_FORMAT(last_paid, "%Y-%m-%d %h:%i:%s") as last_paid from apikey where apikey='${req.query.apikey}'`);
//         console.log("3");
//         if (result.length <= 0) {
//             req.conn.release();
//             return res.status(400).send({
//                 "msg": "invalid apikey!"
//             });
//         } else {
//             req.apikey = result[0];
//             next();
//         }
//     } else {
//         return res.status(401).send({
//             "msg": "apikey is required!"
//         });
//     }
// }

// async function rateLimit(req, res, next) {
//     console.log("RateLimit");
//     if (req.apikey.plan == 0) { //free
//         let result = await executeQuery(req.conn, `select count(*) as n from access_log where apikey = '${req.apikey.apikey}' and accessed_at < now() and accessed_at > now() - interval 1 minute`);
//         result = result[0].n;
//         if (result > 10) {
//             req.conn.release();
//             return res.status(429).send({
//                 "msg": "limit reached!"
//             });
//         } else {
//             next();
//         }
//     } else {
//         next();
//     }
// }

// async function checkPayment(req, res, next) {
//     console.log("CheckPayment");
//     if ([1, 2, 3].includes(req.apikey.plan)) {
//         if (req.apikey.last_paid) {
//             let last_paid = new Date(req.apikey.last_paid);
//             let datenow = new Date();
//             if (datenow - last_paid > 5 * 60 * 1000) {
//                 req.conn.release();
//                 return res.status(402).send({
//                     "msg": "payment required!"
//                 });
//             } else {
//                 next();
//             }
//         } else {
//             req.conn.release();
//             return res.status(402).send({
//                 "msg": "payment required!"
//             });
//         }
//     }
//     else{
//         next();
//     }
// }

// async function authorize(req, res, next) {
//     console.log("Authorize");
//     if (req.apikey.plan == 0) {
//         req.conn.release();
//         return res.status(403).send({
//             "msg": "this endpoint is only for paying user!"
//         });
//     }
//     next();
// }

// async function checkQuota(req, res, next) {
//     console.log("checkQuota");
//     if (req.apikey.plan == 2) {
//         console.log("1");
//         let result = await executeQuery(req.conn, `select count(*) as n from access_log where apikey = '${req.apikey.apikey}' and accessed_at < now() and accessed_at > '${req.apikey.last_paid}'`);
//         console.log(`select count(*) as n from access_log where apikey = '${req.apikey.apikey}' and accessed_at < now() and accessed_at > '${req.apikey.last_paid}'`);
//         result = result[0].n;
//         console.log("2");
//         if (result > 20) {
//             console.log("3");
//             req.conn.release();
//             console.log("4");
//             return res.status(429).send({
//                 "msg": "limit reached!"
//             });
//         } else {
//             console.log("5");
//             next();
//         }
//     } else {
//         console.log("6");
//         next();
//     }
// }

// async function logger(req, res, next) {
//     console.log("logger");
//     console.log("l1");
//     await executeQuery(req.conn, `insert into access_log values (0, '${req.apikey.apikey}', '${req.path}', '${req.url}', now())`);
//     console.log("l2");
//     next();
// }

// module.exports = {
//     "authenticate": authenticate,
//     "rateLimit": rateLimit,
//     "checkPayment": checkPayment,
//     "authorize": authorize,
//     "checkQuota": checkQuota,
//     "logger": logger
// }