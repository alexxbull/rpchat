FROM golang:alpine

ARG environment=dev
ENV APP_ENV ${environment}

RUN mkdir -p /usr/src/rpchat-backend

WORKDIR /usr/src/rpchat-backend

COPY go.mod .

CMD if [ ${APP_ENV} = prod ]; \
    then \
    go build && ./backend; \
    else \
    go get -u github.com/cosmtrek/air && \
    air; \
    fi

EXPOSE 9090