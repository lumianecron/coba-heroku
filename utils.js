const mysql = require("mysql");

const pool = mysql.createPool({
    host: "localhost",
    database: "soainf20202_m8",
    user: "root",
    password: ""
});

function getConnection() {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}

function executeQuery(conn, query) {
    return new Promise(function (resolve, reject) {
        conn.query(query, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    "getConnection": getConnection,
    "executeQuery": executeQuery
}