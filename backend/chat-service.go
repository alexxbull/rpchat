package main

import (
	"context"
	"database/sql"
	"fmt"

	chat "github.com/alexxbull/rpchat/backend/pb"
	_ "github.com/lib/pq"
)

type chatServer struct {
	db *sql.DB
}

func (cs *chatServer) Broadcast(req *chat.EmptyMessage, server chat.ChatService_BroadcastServer) error {

	return nil
}

func (cs *chatServer) SendMessage(ctx context.Context, req *chat.ChatMessageRequest) (*chat.ChatMessageResponse, error) {
	db := cs.db
	res := chat.ChatMessageResponse{Received: false}
	sql := `INSERT INTO messages(user_name, channel_name, message) 
			VALUES($1, $2, $3);`

	stmt, err := db.Prepare(sql)
	if err != nil {
		return &res, fmt.Errorf("Unable to Prepare new message insertion: %v", err)
	}

	_, err = stmt.Exec(req.User, req.Channel, req.Memo)
	if err != nil {
		return &res, fmt.Errorf("Unable to Execute new message insertion: %v", err)
	}

	return &res, nil
}
