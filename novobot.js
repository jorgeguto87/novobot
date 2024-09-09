const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const commander = require('commander')
const axios = require('axios')
const urlRegex = require('url-regex')

const STICKER_COMMAND = "/sticker"

const MediaType = {
    Image: { contentType: "image/jpeg", fileName: "image.jpg" },
    Video: { contentType: "video/mp4", fileName: "image.mp4" }
}

// Parse command line arguments
commander
    .usage('[OPTIONS]...')
    .option('-d, --debug', 'Show debug logs', false)
    .option('-c, --chrome <value>', 'Use a installed Chrome Browser')
    .option('-f, --ffmpeg <value>', 'Use a different ffmpeg')
    .parse(process.argv)

const options = commander.opts()

const log_debug = options.debug ? console.log : () => { }
const puppeteerConfig = !options.chrome ? { executablePath: "/usr/bin/chromium-browser", args: ['--no-sandbox'] } : { executablePath: "/usr/bin/chromium-browser", args: ['--no-sandbox'] }
const ffmpegPath = options.ffmpeg ? options.ffmpeg : undefined

// Inicialize WhatsApp Web client
const client = new Client({
    authStrategy: new LocalAuth(),
    ffmpegPath,
    puppeteer: puppeteerConfig,
    webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
})

client.on('ready', async () => {
    console.log('READY');
    const debugWWebVersion = await client.getWWebVersion();
    console.log(`WWebVersion = ${debugWWebVersion}`);

    client.pupPage.on('pageerror', function(err) {
        console.log('Page error: ' + err.toString());
    });
    client.pupPage.on('error', function(err) {
        console.log('Page error: ' + err.toString());
    });
    
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log('novobot is ready!')
})


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
