package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/golang/protobuf/ptypes"

	chat "github.com/alexxbull/rpchat/backend/protos"

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
	editMessage(conn)
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
		switch {
		case res.Channel != nil:
			ch := res.Channel
			channel := ch.Name
			desc := ch.Description
			owner := ch.Owner
			fmt.Printf("Channel %v created by %v for: %v\n", channel, owner, desc)
		case res.ChatMessage != nil:
			msg := res.ChatMessage
			channel := msg.Channel
			message := msg.Memo
			postDate := ptypes.TimestampString(msg.PostDate)
			user := msg.User
			fmt.Printf("%v @ %v on %v: %v\n", user, postDate, channel, message)

		case res.User != nil:
			user := res.User
			name := user.Name
			image := user.ImagePath
			fmt.Printf("User %v with image at %v\n", name, image)
		}

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

		req := &chat.NewMessageRequest{
			Channel:  "TestChannel",
			Memo:     message,
			PostDate: ptypes.TimestampNow(),
			User:     "TestUser",
		}

		res, err := client.AddMessage(ctx, req)
		if err != nil {
			log.Fatalln("Response error from server:", err)
		}

		fmt.Println("Messaged added with id:", res.Id)
	}
}

func sendMessage(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.NewMessageRequest{
		Channel: "TestChannel",
		Memo:    "Test message from TestUser",
		User:    "TestUser",
	}

	_, err := client.AddMessage(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}
}

func addChannel(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.NewChannelRequest{
		Name:        "NewTestChannel",
		Description: "Test channel made by TestUser",
		Owner:       "TestUser",
	}

	res, err := client.AddChannel(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("Channel added with id:", res.Id)
}

func addUser(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.NewUserRequest{
		Name:      "newUser",
		Email:     "newUser@newUser.com",
		Password:  "newUser",
		ImagePath: "newUser image path",
	}

	res, err := client.AddUser(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("Channel added with id:", res.Id)
}

func editMessage(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.EditMessageRequest{
		Id:   50,
		Memo: "Updated message from TestUser",
	}

	_, err := client.EditMessage(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("Message updated")
}
