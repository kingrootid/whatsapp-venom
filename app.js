// SETTING DEVICES //

const port = 3000
const client_name = "blabla";


// END SETTING DEVICES //


const venom = require('venom-bot');
const express = require('express')
const { body, validationResult } = require('express-validator');
const app = express()
const imageToBase64 = require('image-to-base64');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fs = require('fs');
const mime = require('mime-types');
const qr = require('qrcode-terminal');
const axios = require('axios');
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
venom
    .create(
        client_name,
        (asciiQR) => {
            console.log('Terminal qrcode: ');
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
        const attachment = await axios.get(url, {
            responseType: 'arraybuffer'
        }).then(response => {
            return response.data.toString('base64');
        });
        const formatterNumber = phoneNumberFormatter(number);
        await client
            .sendImage(
                formatterNumber,
                url,
                'Media Gambar',
                caption
            )
            .then((result) => {
                res.status(200).json({
                    status: true,
                    response: result
                });
                    console.log(`{susccess: true,message : "pesan kirim ke from ${number} : '${caption}'"}`);
                })

            })
            .catch((erro) => {
                res.status(500).json({
                    status: false,
                    response: erro
                });
            });

    })
}
