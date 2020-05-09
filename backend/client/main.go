package main

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/golang/protobuf/ptypes"

	chat "github.com/alexxbull/rpchat/backend/pb"

	"google.golang.org/grpc"
)

const addr = "localhost:8080"

func main() {
	conn, err := grpc.Dial(addr, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Unable to connect to %v: %v", addr, err)
	}

	go receiveMessages(conn)
	sendMessage(conn)
}

func sendMessage(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := chat.ChatMessageRequest{
		Channel: "TestChannel",
		Memo:    "Test message from TestUser",
		User:    "TestUser",
	}

	res, err := client.SendMessage(ctx, &req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("Received:", res.Received)
}

func receiveMessages(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := chat.EmptyMessage{}

	stream, err := client.Broadcast(ctx, &req)
	if err != nil {
		log.Fatalln("Unable to receive messages", err)
	}

	res, err := stream.Recv()
	for err == nil {
		channel := res.ChatMessage.Channel
		id := res.Id
		message := res.ChatMessage.Memo
		postDate := ptypes.TimestampString(res.ChatMessage.PostDate)
		user := res.ChatMessage.User

		fmt.Printf("%v @ %v on %v: %v [%v]\n", user, postDate, channel, message, id)

		res, err = stream.Recv()
	}

	if err != io.EOF {
		log.Fatalln("Error receiving message", err)
	}
}
