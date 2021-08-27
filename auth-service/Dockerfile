FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm ci --silent

COPY . .

RUN npm run build && npm prune --production 

CMD [ "npm", "run", "start:prod" ]

