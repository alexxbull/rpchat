FROM node:current-alpine

RUN mkdir -p /usr/src/grpchat-frontend

WORKDIR /usr/src/grpchat-frontend

COPY package.json .

RUN npm install

CMD [ "npm", "start" ]

EXPOSE 3000

COPY . .