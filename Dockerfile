FROM node:18-alpine

ARG symeo_api_key
ARG dd_service
ARG dd_env

RUN mkdir -p /var/app
# Copy NodeJS App to container
COPY . /var/app
WORKDIR /var/app
RUN npm i -g @nestjs/cli
RUN npm install
RUN npm run build

ENV DD_SERVICE=$dd_service
ENV DD_ENV=$dd_env
RUN export DD_AGENT_HOST=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)

ENV TZ=UTC

ENV SYMEO_API_KEY=$symeo_api_key

EXPOSE 9999
CMD node_modules/.bin/symeo-js start --api-key $SYMEO_API_KEY -- node /var/app/dist/main.js