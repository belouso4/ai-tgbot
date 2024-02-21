FROM node:20.11-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

ENV PORT=3000

EXPOSE $PORT

CMD ["npm", "start"]