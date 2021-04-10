const venom = require('venom-bot');
var mysql = require('mysql');
const express = require('express')
const { body, validationResult } = require('express-validator');
const app = express()
const port = 3000
const { phoneNumberFormatter } = require('./helpers/formatter');
const fs = require('fs');
// const { format } = require('node:path');
// const { format } = require('node:path');
// const { body, validationResult } = require('express-validator');
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "whatsapp"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
venom
    .create('blabla')
    .then((client) => start(client, app))
    .catch((erro) => {
        console.log(erro);
    });
async function start(client, app) {
    client.onMessage((message) => {
        if (message.body === 'Hi' && message.isGroupMsg === false) {
            client
                .sendText(message.from, 'Welcome Venom 🕷')
                .then((result) => {
                    console.log('Ada pesan baru');
                    //   console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                    console.log('Ada pesan baru Tapi Error');
                    // console.error('Error when sending: ', erro); //return object error
                });
        }
        let sql = `insert into pesan set body ='${mysql_real_escape_string(message.body)}',fr='${message.from}',status='1'`;
        let query = con.query(sql, (err) => {
            if (err) throw err;
            console.log(`{susccess: true,message : "pesan masuk from ${message.from} : '${message.body}'"}`);
        })
    });
    app.post('/sendText', [
        body('number').notEmpty(),
        body('message').notEmpty()
    ], async (req, res) => {
        const errors = validationResult(req).formatWith(({ msg }) => {
            return msg;
        });
        if (!errors.isEmpty()) {
            return res.status(422).json({
                status: false,
                message: errors.mapped()
            })
        }
        const number = req.body.number;
        const message = req.body.message;
        const formatterNumber = phoneNumberFormatter(number);
        await client
            .sendText(formatterNumber, message)
            .then((result) => {
                res.status(200).json({
                    status: true,
                    response: result
                });
                let sql = `insert into chat set tujuan ='${formatterNumber}',keterangan='${mysql_real_escape_string(message)}',terkirim='1' `
                let query = conn.query(sql, (err) => {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            })
            .catch((erro) => {
                res.status(500).json({
                    status: false,
                    response: erro
                });
            });

    })
    app.post('/sendImage', async (req, res) => {
        var to = req.body.to
        to = to + '@c.us'

        var pesan = req.body.pesan
        var image = req.body.imageurl
        var image_name = req.body.image_name
        // Send image (you can also upload an image using a valid HTTP protocol)
        var valid = true;
        if (req.body.to === "") {
            valid = false;
        }
        if (image === "") {
            valid = false
        }
        if (image_name === "") {
            valid = false
        }
        if (valid) {
            await client
                .sendImage(
                    to,
                    image,
                    image_name,
                    pesan
                )
                .then((result) => {
                    console.log('Result: ', result); //return object success
                    let sql = `insert into chat set tujuan ='${to}',keterangan='${mysql_real_escape_string(pesan)}',terkirim='1' `
                    let query = conn.query(sql, (err) => {
                        if (err) throw err;
                        res.send('{susccess: true,message : "mengirim gambar sukses"}');
                    })
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                    let sql = `insert into chat set tujuan ='${to}',keterangan='${mysql_real_escape_string(pesan)}',mengirim='1' `
                    let query = conn.query(sql, (err) => {
                        if (err) throw err;
                        res.send('{susccess: true,message : "mengirim gambar sukses"}');
                    })
                });
        } else {
            console.log('field required')
        }

    })
}
function pDownload(url, dest) {
    var file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        var responseSent = false; // flag to make sure that response is sent only once.
        if (url.includes('https')) {
            https.get(url, response => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        if (responseSent) return;
                        responseSent = true;
                        resolve();
                    });
                });
            }).on('error', err => {
                if (responseSent) return;
                responseSent = true;
                reject(err);
            });
        } else {
            http.get(url, response => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        if (responseSent) return;
                        responseSent = true;
                        resolve();
                    });
                });
            }).on('error', err => {
                if (responseSent) return;
                responseSent = true;
                reject(err);
            });
        }

    });
}
function mysql_real_escape_string(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char; // prepends a backslash to backslash, percent,
            // and double/single quotes
        }
    });
}