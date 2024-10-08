const { Client, MessageMedia, LocalAuth, Buttons, MessageTypes, List  } = require('whatsapp-web.js')
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

const generateSticker = async (msg, sender) => {
    if (msg.type === "image") {
        log_debug()
        const { data } = await msg.downloadMedia()
        await sendMediaSticker(sender, MediaType.Image, data)
    } else if (msg.type === "video") {
        const { data } = await msg.downloadMedia()
        console.log(data)
        const resp = await sendMediaSticker(sender, MediaType.Video, data)
        console.log(resp)

    } else if (msg.type === "chat") {
        let url = msg.body.split(" ").reduce((acc, elem) => acc ? acc : (urlRegex().test(elem) ? elem : false), false)
        if (url) {
            log_debug("URL:", url)
            let { data, headers } = await axios.get(url, { responseType: 'arraybuffer' })
            data = Buffer.from(data).toString('base64');
            let mediaType;
            if (headers['content-type'].includes("image")) {
                mediaType = MediaType.Image
            } else if (headers['content-type'].includes("video")) {
                mediaType = MediaType.Video
            } else {
                msg.reply("❌ Erro, URL inválida!")
                return
            }
            await sendMediaSticker(sender, mediaType, data)
        } else {
            msg.reply("❌ Erro, URL inválida!")
        }
    }
}

const sendMediaSticker = async (sender, type, data) => {
    const media = new MessageMedia(type.contentType, data, type.fileName)
    await client.sendMessage(sender, media, { sendMediaAsSticker: true })
}

client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log('Wpp-Sticker is ready!')
})

client.on('message_create', async msg => {
    if (msg.body.split(" ")[0] === (STICKER_COMMAND)) {
        log_debug("User:", client.info.wid.user, "To:", msg.to, "From:", msg.from)
        const sender = msg.from.startsWith(client.info.wid.user) ? msg.to : msg.from
        try {
            await generateSticker(msg, sender)
        } catch (e) {
            console.log(e, JSON.stringify(msg, null, 4))
            msg.reply("❌ Erro ao gerar Sticker!")
        }
    }
})

client.initialize()


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
