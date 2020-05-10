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
}

func (cs *chatServer) Broadcast(req *chat.EmptyMessage, server chat.ChatService_BroadcastServer) error {
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
		err := server.Send(&res)
		if err != nil {
			return fmt.Errorf("Unable to send Broadcast message: %v", err)
		}
	}

	return nil
}

func (cs *chatServer) SendMessage(ctx context.Context, req *chat.ChatMessageRequest) (*chat.EmptyMessage, error) {
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
