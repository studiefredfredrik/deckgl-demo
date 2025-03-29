FROM node:22-alpine AS build-frontend

COPY ./package*.json ./app/
COPY ./public/ /app/public/
COPY ./src/ /app/src/
COPY ./server.js/ /app/

WORKDIR /app

RUN npm ci
RUN npm run build

RUN chown node:node /app/public/index.html

USER node

ENTRYPOINT ["node", "server.js"]