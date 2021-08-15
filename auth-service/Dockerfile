FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm ci --silent

COPY . .

CMD [ "npm", "run", "start:dev" ]

