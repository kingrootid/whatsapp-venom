const venom = require('venom-bot');
var mysql = require('mysql');
const express = require('express')
const { body, validationResult } = require('express-validator');
const app = express()
const port = 3000
const nomor = "6285892399939@c.us";
const { phoneNumberFormatter } = require('./helpers/formatter');
const fs = require('fs');
const mime = require('mime-types');
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
// var buf = Buffer.from('abc', 'base64').toString('binary');
// console.log(buf);
venom
    .create('blabla')
    .then((client) => start(client, app))
    .catch((erro) => {
        console.log(erro);
    });
async function start(client, app) {
    client.onMessage(async (message) => {
        if (message.isMedia === true || message.isMMS === true) {
            const buffer = await client.decryptFile(message);
            // At this point you can do whatever you want with the buffer
            // Most likely you want to write it into a file
            const fileName = `some-file-name.${mime.extension(message.mimetype)}`;
            await fs.writeFile(fileName, buffer, (err) => {
            });
        } else {
            let sql = `insert into pesan set body ='${mysql_real_escape_string(message.body)}',sender='${message.from}', receiver='${message.to}', type='${message.type}', time='${message.t}' `;
            let query = con.query(sql, (err) => {
                if (err) throw err;
                console.log(`{susccess: true,message : "pesan masuk from ${message.from} : '${message.body}'"}`);
            })
        }
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
                let sql = `insert into chat set tujuan ='${formatterNumber}',keterangan='${message}' `
                let query = con.query(sql, (err) => {
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
    app.post('/sendImages', [
        body('number').notEmpty(),
        body('caption').notEmpty(),
        body('url').notEmpty(),
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
        const caption = req.body.caption;
        const url = req.body.url;
        const formatterNumber = phoneNumberFormatter(number);
        await client
            .sendImage(
                formatterNumber,
                url,
                'Media Gambar',
                caption
            )
            .then((result) => {
                let sql = `insert into chat set tujuan ='${formatterNumber}',keterangan='${message}' `
                let query = con.query(sql, (err) => {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            })
            .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
            });
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
