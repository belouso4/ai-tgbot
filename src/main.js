import 'dotenv/config'

import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'

import {initCommand, processTextToChat, INITIAL_SESSION} from './logic.js'
import { development, production } from './core/index.js'
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const bot = new Telegraf(BOT_TOKEN)

bot.use(session())

bot.command('new', initCommand)

bot.command('start', initCommand)
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