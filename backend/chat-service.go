package main

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/golang/protobuf/ptypes"

	"google.golang.org/protobuf/types/known/timestamppb"

	chat "github.com/alexxbull/rpchat/backend/pb"
	_ "github.com/lib/pq"
)

type message struct {
	channel  string
	id       int32
	memo     string
	postDate *timestamppb.Timestamp
	user     string
}

type channel struct {
	name         string
	creationDate *timestamppb.Timestamp
	description  string
	owner        string
}

type user struct {
	name      string
	imagePath string
}

type chatServer struct {
	db         *sql.DB
	newMessage chan message
	newChannel chan channel
	newUser    chan user
	streams    []chat.ChatService_ConnectServer
	messageErr chan error
}

func (cs *chatServer) broadcast() {
	for msg := range cs.newMessage {
		res := chat.BroadcastMessage{
			ChatMessage: &chat.ChatMessageRequest{
				Channel:  msg.channel,
				Memo:     msg.memo,
				PostDate: msg.postDate,
				User:     msg.user,
			},
			Id: msg.id,
		}

		for _, stream := range cs.streams {
			err := stream.Send(res.ChatMessage)
			if err != nil {
				cs.messageErr <- fmt.Errorf("Unable to send Broadcast message: %v", err)
				return
			}
		}
	}
}

func (cs *chatServer) AddMessage(ctx context.Context, req *chat.ChatMessageRequest) (*chat.EmptyMessage, error) {
	db := cs.db
	res := chat.EmptyMessage{}
	sql := `INSERT INTO messages(user_name, channel_name, message, post_date) 
			VALUES($1, $2, $3, $4)
			RETURNING id;`

	stmt, err := db.Prepare(sql)
	if err != nil {
		return &res, fmt.Errorf("Unable to Prepare new message insertion: %v", err)
	}

	var id int32
	err = stmt.QueryRow(req.User, req.Channel, req.Memo, ptypes.TimestampString(req.PostDate)).Scan(&id)
	if err != nil {
		return &res, fmt.Errorf("Unable to Execute new message insertion: %v", err)
	}

	cs.newMessage <- message{
		channel:  req.Channel,
		id:       id,
		postDate: req.PostDate,
		memo:     req.Memo,
		user:     req.User,
	}

	return &res, nil
}

func (cs *chatServer) Connect(req *chat.ConnectRequest, stream chat.ChatService_ConnectServer) error {
	// save client's stream for future broadcasting
	cs.streams = append(cs.streams, stream)

	// err := stream.Send(&chat.EmptyMessage{})

	err := stream.Send(&chat.ChatMessageRequest{})
	if err != nil {
		return fmt.Errorf("Unable to connect to client: %v", err)
	}

	return <-cs.messageErr
}
