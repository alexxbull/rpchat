package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	chat "github.com/alexxbull/rpchat/backend/proto/chat"
	"github.com/golang/protobuf/ptypes"
	_ "github.com/lib/pq"
)

type message struct {
	channel string
	id      int32
	memo    string
	user    string
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
	streams      []chat.ChatService_BroadcastServer
	broadcastErr chan error
}

func (cs *chatServer) Broadcast(req *chat.EmptyMessage, stream chat.ChatService_BroadcastServer) error {
	err := stream.Send(&chat.BroadcastMessage{})
	if err != nil {
		return fmt.Errorf("unable to broadcast to user: %v", err)
	}

	// add client's stream for broadcasting updates
	cs.streams = append(cs.streams, stream)

	return <-cs.broadcastErr
}

func (cs *chatServer) broadcast() {
	for {
		select {
		case msg := <-cs.newMessage:
			res := &chat.BroadcastMessage{
				Channel: nil,
				ChatMessage: &chat.NewMessageRequest{
					Channel: msg.channel,
					Memo:    msg.memo,
					User:    msg.user,
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
	sqlStmt := `INSERT INTO channels(channel_name, description, channel_owner) 
			VALUES($1, $2, $3)`

	stmt, err := cs.db.Prepare(sqlStmt)
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
	sqlStmt := `INSERT INTO messages(user_name, channel_name, message) 
			VALUES($1, $2, $3)
			RETURNING id, post_date;`

	stmt, err := db.Prepare(sqlStmt)
	if err != nil {
		return res, fmt.Errorf("Unable to Prepare new message insertion: %v", err)
	}

	var id int32
	var postDate time.Time
	err = stmt.QueryRow(req.User, req.Channel, req.Memo).Scan(&id, &postDate)
	if err != nil {
		errMsg := err.Error()

		switch errMsg {
		case `pq: insert or update on table "messages" violates foreign key constraint "messages_channel_name_fkey"`:
			err = status.Errorf(codes.InvalidArgument, "channel '%s' does not exist", req.Channel)
		case `pq: insert or update on table "messages" violates foreign key constraint "messages_user_name_fkey"`:
			err = status.Errorf(codes.InvalidArgument, "user '%s' does not exist", req.User)
		default:
			fmt.Println("Error in Execute sql for inserting new user in Register service:", err)
			err = status.Errorf(codes.Internal, "Unable to send message. Please try again later.")
		}

		return res, err
	}

	fmt.Println("Message added to db")

	cs.newMessage <- message{
		channel: req.Channel,
		id:      id,
		memo:    req.Memo,
		user:    req.User,
	}

	res.Id = id
	res.PostDate, _ = ptypes.TimestampProto(postDate)
	return res, nil
}

func (cs *chatServer) EditMessage(ctx context.Context, req *chat.EditMessageRequest) (*chat.EmptyMessage, error) {
	res := &chat.EmptyMessage{}
	sqlStmt := `UPDATE messages
			SET message = $1
			WHERE id = $2;`

	stmt, err := cs.db.Prepare(sqlStmt)
	_, err = stmt.Exec(req.Memo, req.Id)
	if err != nil {
		return res, fmt.Errorf("Unable to update message: %v", err)
	}

	return res, nil
}

func (cs *chatServer) EditChannel(ctx context.Context, req *chat.EditChannelRequest) (*chat.EmptyMessage, error) {
	res := &chat.EmptyMessage{}
	sqlStmt := `UPDATE channels
			SET channel_name = $1,
				description  = $2
			WHERE channel_name = $3;`

	stmt, err := cs.db.Prepare(sqlStmt)
	_, err = stmt.Exec(req.NewName, req.Description, req.OldName)
	if err != nil {
		return res, fmt.Errorf("Unable to update channel: %v", err)
	}

	return res, nil
}

func (cs *chatServer) GetChannels(ctx context.Context, req *chat.EmptyMessage) (*chat.GetChannelsResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	sqlStmt := `
	SELECT id, channel_name, description, channel_owner
	FROM channels
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		fmt.Println("Unable to Prepare sql for selecting channels:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load channels. Please try again later.")
	}

	rows, err := stmt.Query()
	if err != nil {
		fmt.Println("Unable to Query channels", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load channels. Please try again later.")
	}
	defer rows.Close()

	var channels []*chat.GetChannelsMessage
	for rows.Next() {
		var channelName, channelDesc, channelOwner string
		var id int32
		err = rows.Scan(&id, &channelName, &channelDesc, &channelOwner)
		if err != nil {
			fmt.Println("Unable to read row returned by Query selecting channels:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load channels. Please try again later.")
		}

		channel := &chat.GetChannelsMessage{
			Id:          id,
			Name:        channelName,
			Description: channelDesc,
			Owner:       channelOwner,
		}
		channels = append(channels, channel)
	}

	res := &chat.GetChannelsResponse{Channels: channels}
	return res, nil
}

func (cs *chatServer) GetUsers(ctx context.Context, req *chat.EmptyMessage) (*chat.GetUsersResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	sqlStmt := `
	SELECT id, user_name, image_path
	FROM users
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		fmt.Println("Unable to Prepare sql for selecting users:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load users. Please try again later.")
	}

	rows, err := stmt.Query()
	if err != nil {
		fmt.Println("Unable to Query users", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load users. Please try again later.")
	}
	defer rows.Close()

	var users []*chat.GetUsersMessage
	for rows.Next() {
		var username, avatar string
		var id int32
		err = rows.Scan(&id, &username, &avatar)
		if err != nil {
			fmt.Println("Unable to read row returned by Query selecting users:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load users. Please try again later.")
		}

		user := &chat.GetUsersMessage{
			Id:     id,
			Name:   username,
			Avatar: fmt.Sprintf("https://localhost:4430/%s", avatar),
		}
		users = append(users, user)
	}

	res := &chat.GetUsersResponse{Users: users}
	return res, nil
}
