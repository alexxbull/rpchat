FROM golang:alpine

RUN mkdir -p /usr/src/grpchat-backend

WORKDIR /usr/src/grpchat-backend

COPY . .

# set timezone to Los Angeles 
RUN apk add --no-cache tzdata
ENV TZ=America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD if [ ${APP_ENV} = prod ]; \
    then \
    go build && ./backend; \
    else \
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost" && \
    go get -tool github.com/air-verse/air@latest && \
    go tool air; \
    fi

EXPOSE 9090