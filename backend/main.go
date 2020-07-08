package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	auth "github.com/alexxbull/rpchat/backend/proto/auth"
	chat "github.com/alexxbull/rpchat/backend/proto/chat"
	"github.com/lib/pq"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

const (
	addr     = ":9090"
	network  = "tcp"
	certFile = "./cert.pem"
	keyFile  = "./key.pem"
)

func main() {
	fmt.Println("connect to db")
	// connect to database
	dbConnInfo := fmt.Sprintf("host=db dbname=%s user=%s password=%s sslmode=disable", os.Getenv("POSTGRES_DB"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"))
	db, err := connectDatabase(dbConnInfo)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	// run postgres listener for deleted records in images table
	go dbListener(dbConnInfo)

	// create grpc server
	var opts []grpc.ServerOption

	// add tls
	creds, _ := credentials.NewServerTLSFromFile(certFile, keyFile)
	opts = append(opts, grpc.Creds(creds))

	// add unary intercepter
	opts = append(opts, grpc.UnaryInterceptor(unaryIntercepter))

	// add stream intercepter
	opts = append(opts, grpc.StreamInterceptor(streamIntercpeter))

	server := grpc.NewServer(opts...)

	lis, err := net.Listen(network, addr)
	if err != nil {
		log.Fatalf("Unable to listen on %v: %v", addr, err)
	}

	// authentication services server
	as := authServer{db}

	// chat services server
	cs := chatServer{
		db:           db,
		newMessage:   make(chan message),
		newChannel:   make(chan channel),
		newUser:      make(chan user),
		broadcastErr: make(chan error),
	}
	go cs.broadcast()

	// register services
	auth.RegisterAuthServiceServer(server, &as)
	chat.RegisterChatServiceServer(server, &cs)

	// start file server
	go func() {
		http.Handle("/", http.FileServer(http.Dir("./static")))
		fmt.Println("Starting file server")
		err := http.ListenAndServeTLS(":4430", certFile, keyFile, nil)
		// err := http.ListenAndServe(":4430", nil)
		if err != nil {
			fmt.Println("File server error", err)
			log.Fatal(err)
		}
	}()

	// start grpc server
	fmt.Println("Starting grpc server...")
	server.Serve(lis)
}

func connectDatabase(dbConnInfo string) (*sql.DB, error) {
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

func dbListener(dbConnInfo string) {
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

func unaryIntercepter(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
	fmt.Println("Unary intercepter:", info.FullMethod)

	// authenticate user
	if err := authenticate(ctx, info.FullMethod); err != nil {
		return nil, err
	}

	return handler(ctx, req)
}

func streamIntercpeter(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	fmt.Println("Stream intercepter:", info.FullMethod)

	// authenticate user
	if err := authenticate(stream.Context(), info.FullMethod); err != nil {
		return err
	}

	return handler(srv, stream)
}
