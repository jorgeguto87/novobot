const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia, MessageTypes } = require('whatsapp-web.js');
const client = new Client ();
    
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Conectado com sucesso!');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {

    if (msg.body.match(/(bot)/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        const contact = await msg.getContact();
        const name = contact.pushname;
        await client.sendMessage(msg.from,'*Fala* '+ name.split(" ")[0] + ', o que manda?\n\n_Eu sou um teste de *CHATBOT* e estou funcionando perfeitamente._');

    }

    if (msg.body.match(/(sabadou)/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
        const media = MessageMedia.fromFilePath('Boa.jpg');
        await client.sendMessage(msg.from, media);
    }

});
