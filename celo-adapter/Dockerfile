FROM node:14

ENV PORT=8080
EXPOSE 8080

WORKDIR /app

COPY package.json .

RUN yarn

COPY . .

ENTRYPOINT [ "yarn", "start" ]