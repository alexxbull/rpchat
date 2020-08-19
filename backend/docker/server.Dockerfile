FROM golang:alpine

RUN mkdir -p /usr/src/grpchat-backend

WORKDIR /usr/src/grpchat-backend

COPY . .

CMD if [ ${APP_ENV} = prod ]; \
    then \
    go build && ./backend; \
    else \
    go get -u github.com/cosmtrek/air && \
    air; \
    fi

EXPOSE 9090