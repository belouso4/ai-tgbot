# Telegram бот работающий с ChatGPT

Receives text and voice messages

The project used OpenAi API, Node.js and Telegraf library. 

## Before you start

First rename `.env.example` file to `.env` and fill in all necessary values.

```
BOT_TOKEN="<YOUR_BOT_API_TOKEN>"
OPENAI_API_KEY="<YOUR_OPENAI_API_TOKEN>"
```
## Start your server

```
npm install
npm run dev
```

## Production

```
make build
make run
```