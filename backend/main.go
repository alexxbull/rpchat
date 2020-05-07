package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/timestamp"
	"github.com/lib/pq"
	"google.golang.org/grpc"

	chat "github.com/alexxbull/rpchat/backend/pb"
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
	chat.RegisterChatServiceServer(server, &chatServer{})

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

type chatServer struct{}

func (cs *chatServer) Chat(in chat.ChatService_ChatServer) error {
	if cs == nil {
		return fmt.Errorf("Chat called on nil object")
	}

	readErr := make(chan error)
	go readChat(readErr, in)

	// send message to clients
	// var messages []chat.ChatMessageRequest
	messages := []chat.ChatMessageRequest{
		{
			User: "John",
			Date: &timestamp.Timestamp{Seconds: time.Now().Unix()},
			Msg:  "Hello from John",
		},
		{
			User: "Sally",
			Date: &timestamp.Timestamp{Seconds: time.Now().Add(2 * time.Second).Unix()},
			Msg:  "Hello from Sally",
		},
	}

	for _, v := range messages {
		err := in.Send(&v)
		if err != nil {
			fmt.Printf("Chat error sending message: %v", err)
		}
	}

	// read errors from client
	if err := <-readErr; err != nil {
		return err
	}

	return nil
}

func readChat(readErr chan<- error, in chat.ChatService_ChatServer) {
	for {
		req, err := in.Recv()

		if err == io.EOF {
			readErr <- nil
			return
		}

		if err != nil {
			readErr <- fmt.Errorf("readChat error: %v", err)
			return
		}

		ts, _ := ptypes.Timestamp(req.Date)

		fmt.Printf("%v - %v: %v\n", ts, req.User, req.Msg)
	}
}
