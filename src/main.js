import 'dotenv/config'

import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { ogg } from './ogg.js'
import { removeFile } from './utils.js'
import { openai } from './openai.js'
import {initCommand, processTextToChat, INITIAL_SESSION} from './logic.js'
import { development, production } from './core/index.js'
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const bot = new Telegraf(BOT_TOKEN)

bot.use(session())

bot.command('new', initCommand)

bot.command('start', initCommand)

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)

        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        removeFile(oggPath)

        const text = await openai.transcription(mp3Path)

        removeFile(mp3Path)
        
        await ctx.reply(code(`Ваш запрос: ${text}`))

        // await ctx.reply(JSON.stringify(link, null, 2))
        await processTextToChat(ctx, text)
    } catch (e) {
        console.log(`Error while voice message`, e.message)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
      await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))
      await processTextToChat(ctx, ctx.message.text)
    } catch (e) {
      console.log(`Error while voice message`, e.message)
    }
})

//prod mode (Vercel)
export const startVercel = async (req, res) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);