package main

import (
	"log"
	"net"

	"google.golang.org/grpc"
)

const (
	addr    = "localhost:8080"
	network = "tcp"
)

func main() {
	var opts []grpc.ServerOption

	// tls security

	server := grpc.NewServer(opts...)

	lis, err := net.Listen(network, addr)
	if err != nil {
		log.Fatalf("Unable to listen on %v: %v", addr, err)
	}

	// Register services

	server.Serve(lis)
}
