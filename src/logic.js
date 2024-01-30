import { openai } from './openai.js'

export const INITIAL_SESSION = {
  messages: [],
}

export const SELECT_LANGUAGE = {
  'Русский': 'ru',
  'English': 'en',
  'Tiếng Việt': 'vi'
}

export async function processTextToChat(ctx, content) {
  try {
    ctx.session.messages.push({ role: openai.roles.USER, content })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    })

    return response.content
  } catch (e) {
    console.log('Error while proccesing text to gpt', e.message)
  }
}