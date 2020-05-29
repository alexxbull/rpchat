package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/golang/protobuf/ptypes"

	"google.golang.org/protobuf/types/known/timestamppb"

	chat "github.com/alexxbull/rpchat/backend/proto"
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
	name  string
	desc  string
	owner string
}

type user struct {
	name      string
	email     string
	password  string
	imagePath string
}

type chatServer struct {
	db           *sql.DB
	newMessage   chan message
	newChannel   chan channel
	newUser      chan user
	streams      []chat.ChatService_ConnectServer
	broadcastErr chan error
}

func (cs *chatServer) Connect(req *chat.ConnectRequest, stream chat.ChatService_ConnectServer) error {
	// save client's stream for future broadcasting
	cs.streams = append(cs.streams, stream)

	err := stream.Send(&chat.BroadcastMessage{})
	if err != nil {
		return fmt.Errorf("Unable to connect to client: %v", err)
	}

	return <-cs.broadcastErr
}

func (cs *chatServer) broadcast() {
	for {
		select {
		case msg := <-cs.newMessage:
			res := &chat.BroadcastMessage{
				Channel: nil,
				ChatMessage: &chat.NewMessageRequest{
					Channel:  msg.channel,
					Memo:     msg.memo,
					PostDate: msg.postDate,
					User:     msg.user,
				},
			}
			cs.broadcastObject(res, "message")

		case ch := <-cs.newChannel:
			res := &chat.BroadcastMessage{
				Channel: &chat.NewChannelRequest{
					Name:        ch.name,
					Description: ch.desc,
					Owner:       ch.owner,
				},
				ChatMessage: nil,
			}
			cs.broadcastObject(res, "channel")
		case usr := <-cs.newUser:
			res := &chat.BroadcastMessage{
				Channel:     nil,
				ChatMessage: nil,
				User: &chat.NewUserRequest{
					Name:      usr.name,
					ImagePath: usr.imagePath,
				},
			}
			cs.broadcastObject(res, "user")
		}
	}
}

// broadcastObject
// Broadcast object to all clients
func (cs *chatServer) broadcastObject(res *chat.BroadcastMessage, origin string) {
	for _, stream := range cs.streams {
		err := stream.Send(res)
		if err != nil {
			cs.broadcastErr <- fmt.Errorf("Unable to Broadcast %v: %v", origin, err)
			return
		}
	}
}

func (cs *chatServer) AddChannel(ctx context.Context, req *chat.NewChannelRequest) (*chat.EmptyMessage, error) {
	res := &chat.EmptyMessage{}
	sql := `INSERT INTO channels(channel_name, description, channel_owner) 
			VALUES($1, $2, $3)`

	stmt, err := cs.db.Prepare(sql)
	if err != nil {
		return res, fmt.Errorf("Unable to Prepare new channel insertion: %v", err)
	}

	_, err = stmt.Exec(req.Name, req.Description, req.Owner)
	if err != nil {
		return res, fmt.Errorf("Unable to Execute new message insertion: %v", err)
	}

	cs.newChannel <- channel{
		name:  req.Name,
		desc:  req.Description,
		owner: req.Owner,
	}

	return res, nil
}

func (cs *chatServer) AddMessage(ctx context.Context, req *chat.NewMessageRequest) (*chat.NewMessageResponse, error) {
	db := cs.db
	res := &chat.NewMessageResponse{}
	sql := `INSERT INTO messages(user_name, channel_name, message, post_date) 
			VALUES($1, $2, $3, $4)
			RETURNING id;`

	stmt, err := db.Prepare(sql)
	if err != nil {
		return res, fmt.Errorf("Unable to Prepare new message insertion: %v", err)
	}

	var id int32
	err = stmt.QueryRow(req.User, req.Channel, req.Memo, ptypes.TimestampString(req.PostDate)).Scan(&id)
	if err != nil {
		return res, fmt.Errorf("Unable to Execute new message insertion: %v", err)
	}

	cs.newMessage <- message{
		channel:  req.Channel,
		id:       id,
		postDate: req.PostDate,
		memo:     req.Memo,
		user:     req.User,
	}

	res.Id = id
	return res, nil
}

func (cs *chatServer) AddUser(ctx context.Context, req *chat.NewUserRequest) (*chat.EmptyMessage, error) {
	db := cs.db
	res := &chat.EmptyMessage{}
	sql := `INSERT INTO users(user_name, email, user_password, image_path)
			VALUES($1, $2, $3, $4)`

	stmt, err := db.Prepare(sql)
	if err != nil {
		return res, fmt.Errorf("Unable to Prepare new message insertion: %v", err)
	}

	_, err = stmt.Exec(req.Name, req.Email, req.Password, req.ImagePath)
	if err != nil {
		return res, fmt.Errorf("Unable to Execute new message insertion: %v", err)
	}

	cs.newUser <- user{
		name:      req.Name,
		email:     req.Email,
		password:  req.Password,
		imagePath: req.ImagePath,
	}

	return res, nil
}

func (cs *chatServer) EditMessage(ctx context.Context, req *chat.EditMessageRequest) (*chat.EmptyMessage, error) {
	res := &chat.EmptyMessage{}
	sql := `UPDATE messages
			SET message = $1
			WHERE id = $2;`

	stmt, err := cs.db.Prepare(sql)
	_, err = stmt.Exec(req.Memo, req.Id)
	if err != nil {
		return res, fmt.Errorf("Unable to update message: %v", err)
	}

	return res, nil
}

func (cs *chatServer) EditChannel(ctx context.Context, req *chat.EditChannelRequest) (*chat.EmptyMessage, error) {
	res := &chat.EmptyMessage{}
	sql := `UPDATE channels
			SET channel_name = $1,
				description  = $2
			WHERE channel_name = $3;`

	stmt, err := cs.db.Prepare(sql)
	_, err = stmt.Exec(req.NewName, req.Description, req.OldName)
	if err != nil {
		return res, fmt.Errorf("Unable to update channel: %v", err)
	}

	return res, nil
}

func (cs *chatServer) EditUser(ctx context.Context, req *chat.EditUserRequest) (*chat.EmptyMessage, error) {
	if cs == nil {
		log.Fatalln("Nil chatServer pointer")
	}

	res := &chat.EmptyMessage{}
	sql := `UPDATE users
			SET email = $1,
				user_name  = $2,
				user_password  = $3
			WHERE user_name = $4;`

	// TODO: validate user

	stmt, err := cs.db.Prepare(sql)
	_, err = stmt.Exec(req.Email, req.Name, req.Password, req.OldName)
	if err != nil {
		return res, fmt.Errorf("Unable to update user: %v", err)
	}

	return res, nil
}
