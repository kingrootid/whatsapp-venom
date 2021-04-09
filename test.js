const venom = require('venom-bot');

async () => {
    const marketingClient = await venom.create('marketing')
        .then((client) => start(client))
        .catch((erro) => {
            console.log(erro);
        });;
    const salesClient = await venom.create('sales');
    const supportClient = await venom.create('support');
};
function start(salesClient) {
    client.onMessage((message) => {
        if (message.body === 'Hi') {
            client.sendText(message.from, 'Welcome Venom 🕷');
        }
    });
}