package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"

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

	stream, err := connect(conn)
	if err != nil {
		log.Fatalln("Unable to connect to server:", err)
	}

	go broadcastListen(stream)
	sendMessageShell(conn)
}

func connect(conn grpc.ClientConnInterface) (chat.ChatService_ConnectClient, error) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.ConnectRequest{User: "TestUser"}

	stream, err := client.Connect(ctx, req)
	if err != nil {
		return stream, err
	}

	_, err = stream.Recv()
	if err != nil {
		return stream, err
	}

	return stream, nil
}

func broadcastListen(stream chat.ChatService_ConnectClient) {
	res, err := stream.Recv()
	for err == nil {
		channel := res.Channel
		message := res.Memo
		postDate := ptypes.TimestampString(res.PostDate)
		user := res.User

		fmt.Printf("%v @ %v on %v: %v\n", user, postDate, channel, message)

		res, err = stream.Recv()
	}

	if err != io.EOF {
		log.Fatalln("Unable to receive broadcasted messages:", err)
	}
}

func sendMessageShell(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Print("-> ")
		message, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Unable to read shell message:", err)
			continue
		}

		req := chat.ChatMessageRequest{
			Channel:  "TestChannel",
			Memo:     message,
			PostDate: ptypes.TimestampNow(),
			User:     "TestUser",
		}

		_, err = client.SendMessage(ctx, &req)
		if err != nil {
			log.Fatalln("Response error from server:", err)
		}
	}
}

func sendMessage(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := chat.ChatMessageRequest{
		Channel: "TestChannel",
		Memo:    "Test message from TestUser",
		User:    "TestUser",
	}

	_, err := client.SendMessage(ctx, &req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}
}
