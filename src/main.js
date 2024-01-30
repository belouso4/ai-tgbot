import 'dotenv/config'

import { Telegraf, session, Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import TelegrafI18n from 'telegraf-i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

import { ogg } from './ogg.js'
import { removeFile } from './utils.js'
import { openai } from './openai.js'
import {processTextToChat, INITIAL_SESSION, SELECT_LANGUAGE} from './logic.js'

const bot = new Telegraf(process.env.BOT_TOKEN)

const i18n = new TelegrafI18n({
  directory: path.resolve(__dirname, 'locales'),
  defaultLanguage: 'en',
  sessionName: 'session',
  allowMissing: false,
  useSession: true,
})

bot.use(session())
bot.use(i18n.middleware())

bot.command('start', async ctx => {
  await ctx.reply(
    ctx.i18n.t('chooseLang'),
    Markup.keyboard([Object.keys(SELECT_LANGUAGE)])
        .oneTime()
        .resize()
  )
})

bot.hears(Object.keys(SELECT_LANGUAGE), async (ctx) => {
  ctx.i18n.locale(SELECT_LANGUAGE[ctx.message.text]);
 
  await ctx.reply( 
    ctx.i18n.t('start'),
    Markup.removeKeyboard()
  )
});

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION

    try {
        const processingConverter = await ctx.reply(code(ctx.i18n.t('converter')))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)

        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        removeFile(oggPath)
        const text = await openai.transcription(mp3Path)

        removeFile(mp3Path)
        await ctx.telegram.editMessageText(
          ctx.chat.id, 
          processingConverter.message_id, 
          null, 
          code(ctx.i18n.t('yourRequest', {text}))
        )
   
        const processingAi = await ctx.reply(code(ctx.i18n.t('processingAi')))
        const processedText = await processTextToChat(ctx, text)
     
        await ctx.telegram.editMessageText(
          ctx.chat.id, 
          processingAi.message_id, 
          null, 
          processedText
        )  
    } catch (e) {
        console.log(`Error while voice message.`, e.message)
    }
})


bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
      const processingAi = await ctx.reply(code(ctx.i18n.t('processingAi')))
      const processedText = await processTextToChat(ctx, ctx.message.text)
      
      await ctx.telegram.editMessageText(
        ctx.chat.id, 
        processingAi.message_id, 
        null, 
        processedText
      )  
    } catch (e) {
      console.log(`Error while voice message`, e.message)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))