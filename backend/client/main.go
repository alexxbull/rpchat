package main

import (
	"context"
	"fmt"
	"log"

	chat "github.com/alexxbull/rpchat/backend/pb"

	"google.golang.org/grpc"
)

const addr = "localhost:8080"

func main() {
	conn, err := grpc.Dial(addr, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Unable to connect to %v: %v", addr, err)
	}

	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := chat.ChatMessageRequest{User: "TestUser", Memo: "Test message from TestUser", Channel: "TestChannel"}

	res, err := client.SendMessage(ctx, &req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("Received:", res.Received)
}
