FROM node:18-alpine

RUN mkdir -p /var/app
# Copy NodeJS App to container
COPY . /var/app
RUN npm i -g @nestjs/cli
RUN npm install --prefix /var/app
RUN npm run config:build --prefix /var/app
RUN npm run build --prefix /var/app

ENV TZ=UTC

EXPOSE 3000
CMD node /var/app/build/main.js
