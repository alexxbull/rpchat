package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/timestamp"

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
	stream, err := client.Chat(context.Background())
	if err != nil {
		log.Fatalf("rpc Chat error: %v", err)
	}

	readErr := make(chan error)
	go readChat(readErr, stream)

	for i := 0; i < 5; i++ {
		time.Sleep(time.Second)
		err = stream.Send(&chat.ChatMessageRequest{
			User: "TestClient:",
			Date: &timestamp.Timestamp{Seconds: time.Now().Unix()},
			Msg:  "Hello",
		})

		if err != nil {
			fmt.Printf("rpc Chat error sending to server: %v", err)
			break
		}

	}
	stream.CloseSend()

	if err = <-readErr; err != nil {
		log.Fatalf("rpc Chat error reading from server: %v", err)
	}
}

func readChat(readErr chan<- error, stream chat.ChatService_ChatClient) {
	for {
		req, err := stream.Recv()

		if err == io.EOF {
			readErr <- nil
			return
		}

		if err != nil {
			readErr <- fmt.Errorf("readChat error: %v", err)
			return
		}

		ts, err := ptypes.Timestamp(req.Date)

		fmt.Printf("%v - %v: %v\n", ts, req.User, req.Msg)
	}

}
