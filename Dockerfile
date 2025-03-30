FROM node:22-alpine AS build-frontend

COPY ./package*.json ./app/
COPY ./webpack.config.js ./app/
COPY ./public/ /app/public/
COPY ./src/ /app/src/
COPY ./server.js/ /app/

WORKDIR /app

RUN npm ci
RUN npm run build

# API key is replaced during startup by server.js and only available in runtime, so the process needs write access
RUN chown node:node /app/public/index.html

USER node

ENTRYPOINT ["node", "server.js"]