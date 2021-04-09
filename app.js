const venom = require('venom-bot');

const express = require('express')
const app = express()
const port = 3000
const { phoneNumberFormatter } = require('./helpers/formatter');
venom
    .create()
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });
venom.create(
    'blabla',
    undefined,
    (statusSession, session) => {
        // return: isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
        console.log('Status Session: ', statusSession);
        // create session wss return "serverClose" case server for close
        console.log('Session name: ', session);
    },
    undefined
)
    .then((blabla) => clientB(blabla))
    .catch((erro) => {
        console.log(erro);
    });
async function start(client) {
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
    });
    let battery = await client.getBatteryLevel();
    // console.log(battery);
    app.get('/', function (req, res) {
        res.status(200).json({ error: 'message' })
    })
    // console.log(client.getBatteryLevel());
}
async function clientB(client) {
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
    });
    let battery = await client.getBatteryLevel();
    // console.log(battery);
    app.get('/', function (req, res) {
        res.status(200).json({ error: 'message' })
    })
    // console.log(client.getBatteryLevel());
}

// FUNCTION CEK VALID NUMBER WHATSAPP 
// const checkRegisteredNumber = async function (number) {
//     const isRegistered = await client.isRegisteredUser(number);
//     return isRegistered;
// }



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
// app.post('/send-message', [
//     body('number').notEmpty(),
//     body('message').notEmpty(),
// ], async (req, res) => {
//     const errors = validationResult(req).formatWith(({
//         msg
//     }) => {
//         return msg;
//     });

//     if (!errors.isEmpty()) {
//         return res.status(422).json({
//             status: false,
//             message: errors.mapped()
//         });
//     }

//     const number = phoneNumberFormatter(req.body.number);
//     const message = req.body.message;

//     const isRegisteredNumber = await checkRegisteredNumber(number);

//     if (!isRegisteredNumber) {
//         return res.status(422).json({
//             status: false,
//             message: 'The number is not registered'
//         });
//     }

//     client.sendMessage(number, message).then(response => {
//         res.status(200).json({
//             status: true,
//             response: response
//         });
//     }).catch(err => {
//         res.status(500).json({
//             status: false,
//             response: err
//         });
//     });
// });