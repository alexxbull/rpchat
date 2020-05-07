package main

import (
	"fmt"
	"io"
	"time"

	chat "github.com/alexxbull/rpchat/backend/pb"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/timestamp"
)

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
