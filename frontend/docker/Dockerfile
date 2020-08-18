FROM node:current-alpine

RUN mkdir -p /usr/src/grpchat-frontend

WORKDIR /usr/src/grpchat-frontend

COPY package.json .

RUN npm install

CMD if [ ${APP_ENV} = prod ]; \
    then \
    npm run build && \
    serve -s build; \
    else \
    npm start; \
    fi

EXPOSE 3000 5000

COPY . .