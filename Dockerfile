FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install -qy2

COPY . .

ENV NODE_ENV=production

RUN npm ci --only=production && npm cache clean --force

RUN npm install pm2 -g

EXPOSE 8080

CMD [ "pm2-runtime", "server.js", '-i', 'max' ]