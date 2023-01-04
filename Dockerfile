FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install -qy2

COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]