FROM node:18-alpine

RUN mkdir -p /var/app
# Copy NodeJS App to container
COPY . /var/app
WORKDIR /var/app
RUN npm i -g @nestjs/cli
RUN npm i -g @nestjs/cli
RUN npm install
RUN npm run config:build
RUN npm run build

ENV TZ=UTC

EXPOSE 3000
CMD node_modules/.bin/symeo -e symeo.staging.yml -- node /var/app/dist/main.js
