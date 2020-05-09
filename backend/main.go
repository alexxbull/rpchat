package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	chat "github.com/alexxbull/rpchat/backend/pb"
	"github.com/lib/pq"
	"google.golang.org/grpc"
)

const (
	addr       = "localhost:8080"
	network    = "tcp"
	dbConnInfo = "dbname=grpchat user=alexx password=admin sslmode=disable"
)

func main() {
	// connect to database
	db, err := connectDatabase()
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	// run postgres listener for deleted records in images table
	go dbListener()

	// create grpc server
	var opts []grpc.ServerOption

	// TODO: add tls security

	server := grpc.NewServer(opts...)

	lis, err := net.Listen(network, addr)
	if err != nil {
		log.Fatalf("Unable to listen on %v: %v", addr, err)
	}

	// register services
	chat.RegisterChatServiceServer(server, &chatServer{db})

	// start grpc server
	fmt.Println("Starting server...")
	server.Serve(lis)
}

func connectDatabase() (*sql.DB, error) {
	db, err := sql.Open("postgres", dbConnInfo)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	fmt.Println("Connected to database")

	return db, nil
}

func dbListener() {
	reportConnError := func(event pq.ListenerEventType, err error) {
		if err != nil {
			fmt.Println("Connection error while listening to database:", err)
		}
	}

	listener := pq.NewListener(dbConnInfo, 10*time.Second, time.Minute, reportConnError)
	err := listener.Listen("events")
	if err != nil {
		log.Fatalln("Unable to listen to pg Listener:", err)
	}

	// listen for image deletions
	fmt.Println("Listening to database...")
	for {
		notice := <-listener.Notify
		payload := notice.Extra

		//Unmarshal payload
		type deleteImage struct {
			Path string `json:"path"`
		}

		var imgDelete deleteImage
		err = json.Unmarshal([]byte(payload), &imgDelete)
		if err != nil {
			log.Fatalln("Unmarsharlling payload error:", err)
		}

		// delete file
		err = os.Remove(imgDelete.Path)
		if err != nil {
			fmt.Println("Unable to delete file:", err)
			continue
		}

		fmt.Println("File deleted:", imgDelete.Path)
	}
}
