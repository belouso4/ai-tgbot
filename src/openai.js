import OpenAI from 'openai'
import { createReadStream } from 'fs'

class OpenAi {

    roles = {
      ASSISTANT: 'assistant',
      USER: 'user',
      SYSTEM: 'system',
    }

    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey
        });
    }

    async chat(messages) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
        })

        return response.choices[0].message
      } catch (e) {
        console.log('Error while gpt chat', e.message)
      }
    }

    async transcription(filepath) {
        try {
          const response = await this.openai.audio.transcriptions.create(
            {
              file: createReadStream(filepath),
              model: 'whisper-1',
            },
          )
          return response.text
        } catch (e) {
          console.log('Error while transcription', e.message)
        }
      }

}

export const openai = new OpenAi(process.env.OPENAI_API_KEY)