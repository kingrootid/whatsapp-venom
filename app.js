// SETTING DEVICES //

const port = 3000
const client_name = "blabla";
const id_devices = 3;


// END SETTING DEVICES //
const venom = require('venom-bot');
var mysql = require('mysql');
const express = require('express')
const { body, validationResult } = require('express-validator');
const app = express()

const { phoneNumberFormatter } = require('./helpers/formatter');
const fs = require('fs');
const mime = require('mime-types');
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const currentDate = new Date();
const timestamp = currentDate.getTime();
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
    .create(
        client_name,
        (base64Qrimg, asciiQR) => {
            console.log('Terminal qrcode: ', asciiQR);
        },
        (statusSession) => {
            console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled
        },
        {
            folderNameToken: 'tokens', //folder name when saving tokens
            mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
            headless: true, // Headless chrome
            devtools: false, // Open devtools by default
            useChrome: true, // If false will use Chromium instance
            debug: false, // Opens a debug session
            logQR: true, // Logs QR automatically in terminal
            browserArgs: [
                '--no-sandbox',
            ], // Parameters to be added into the chrome browser instance
            disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
            disableWelcome: true, // Will disable the welcoming message which appears in the beginning
            updatesLog: true, // Logs info updates automatically in terminal
            autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
        }
    )
    .then((client) => {
        start(client, app);
    })
    .catch((erro) => {
        console.log(erro);
    });
async function start(client, app) {
    client.onMessage(async (message) => {
        let buffer = null

        if (message.isMedia === true || message.isMMS === true) {
            // console.log(message);
            buffer = await client.decryptFile(message);
            const fileName = `some-file-name.${mime.extension(message.mimetype)}`;
            await fs.writeFile(fileName, buffer, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });
        } else {
            let sql = `insert into pesan set id_devices='${id_devices}', body ='${mysql_real_escape_string(message.body)}',sender='${message.from}', receiver='${message.to}', type='${message.type}', time='${timestamp}' `;
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
                // console.log(result.me.wid._serialized);
                let sql = `insert into pesan set id_devices='${id_devices}', body ='${mysql_real_escape_string(result.text)}',sender='${result.me.wid._serialized}', receiver='${formatterNumber}', type='${result.type}', time='${timestamp}' `;
                let query = con.query(sql, (err) => {
                    if (err) throw err;
                    console.log(`{susccess: true,message : "pesan kirim ke from ${number} : '${message}'"}`);
                })

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
        let mimetype;
        const attachment = await axios.get(url, {
            responseType: 'arraybuffer'
        }).then(response => {
            mimetype = response.headers['content-type'];
            return response.data.toString('base64');
        });
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
