FROM node:latest

RUN mkdir /usr/src/app

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]

COPY . .

RUN ls