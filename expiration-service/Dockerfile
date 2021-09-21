FROM node:alpine as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY . .

RUN npm ci --silent && npm run build

FROM node:alpine as runner

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

CMD ["npm", "start"]