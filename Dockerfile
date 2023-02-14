FROM node:18-alpine

ARG symeo_api_key

RUN mkdir -p /var/app
# Copy NodeJS App to container
COPY . /var/app
WORKDIR /var/app
RUN npm i -g @nestjs/cli
RUN npm install
RUN npm run config:build
RUN npm run build

ENV TZ=UTC

ENV SYMEO_API_KEY=$symeo_api_key

EXPOSE 9999
CMD node_modules/.bin/symeo-js --api-key $SYMEO_API_KEY --api-url https://config-staging.symeo.io/api/v1/values -- node /var/app/dist/main.js