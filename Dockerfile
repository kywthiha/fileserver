FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install -qy2

COPY . .

ENV NODE_ENV=production

RUN npm ci --only=production && npm cache clean --force

EXPOSE 8080

CMD [ "node", "server.js" ]