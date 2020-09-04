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
	"github.com/lib/pq"
	log "github.com/sirupsen/logrus"
)

type user struct {
	broadcastErr chan error
	name         string
	stream       chat.ChatService_BroadcastServer
}

type chatServer struct {
	db                 *sql.DB
	deletedChannel     chan *chat.DeleteChannelRequest
	deletedChatMessage chan *chat.DeleteMessageRequest
	editChatMessage    chan *chat.EditMessageRequest
	editChannelMessage chan *chat.EditChannelRequest
	getUsersResponse   chan *chat.GetUsersResponse
	newChatMessage     chan *chat.GetMessagesMessage
	newChannelMessage  chan *chat.GetChannelsMessage
	newUserMessage     chan *chat.GetUsersMessage
	users              map[string]user
}

func (cs *chatServer) CloseBroadcast(ctx context.Context, req *chat.BroadcastRequest) (*chat.EmptyMessage, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	// close stream for disconnected user
	if user, ok := cs.users[req.Username]; ok {
		log.Println("Closing broadcast for user", req.Username)
		user.broadcastErr <- nil
	} else {
		log.Println("no stream for user:", req.Username)
		return nil, status.Errorf(codes.InvalidArgument, "User: '%s' does not have an active stream", req.Username)
	}

	res := &chat.EmptyMessage{}
	return res, nil
}

func (cs *chatServer) Broadcast(req *chat.BroadcastRequest, stream chat.ChatService_BroadcastServer) error {
	err := stream.Send(&chat.BroadcastResponse{Connected: true})
	if err != nil {
		return fmt.Errorf("unable to broadcast to user: %v", err)
	}

	// store the new user's information needed for broadcasting
	newUser := user{
		broadcastErr: make(chan error),
		name:         req.Username,
		stream:       stream,
	}

	log.Printf("stream for user %s: %v\n", req.Username, stream)

	// add user's stream for broadcasting updates if they don't have an open stream
	if _, hasUser := cs.users[req.Username]; !hasUser {
		cs.users[req.Username] = newUser
		log.Printf("Broadcast stream opened for user: %s", req.Username)
	}

	// block until user disconnects
	err = <-newUser.broadcastErr

	// remove disconnected user
	delete(cs.users, req.Username)
	log.Printf("Removed user %s\n", req.Username)

	getUsersResponse, getUsersErr := cs.GetUsers(context.Background(), &chat.EmptyMessage{})
	if getUsersErr != nil {
		log.Printf("User %s disconnected but unable to reload user's list", req.Username)
	}
	log.Println("getUsersResponse received", getUsersResponse)
	cs.getUsersResponse <- getUsersResponse

	if err != nil {
		log.Printf("Broadcast err with user %s: %v\n", req.Username, err)
		return status.Errorf(codes.DataLoss, "Lost connection with server")
	}

	return nil
}

func (cs *chatServer) broadcast() {
	for {
		select {
		case msg := <-cs.newChatMessage:
			res := &chat.BroadcastResponse{ChatMessage: msg}
			cs.broadcastObject(res, "add-message")

		case ch := <-cs.newChannelMessage:
			res := &chat.BroadcastResponse{Channel: ch}
			cs.broadcastObject(res, "add-channel")

		case deletedChannel := <-cs.deletedChannel:
			res := &chat.BroadcastResponse{ChannelDeleted: deletedChannel}
			cs.broadcastObject(res, "deleted-message")

		case deletedMessage := <-cs.deletedChatMessage:
			res := &chat.BroadcastResponse{ChatMessageDeleted: deletedMessage}
			cs.broadcastObject(res, "deleted-message")

		case channelEdit := <-cs.editChannelMessage:
			res := &chat.BroadcastResponse{ChannelEdit: channelEdit}
			cs.broadcastObject(res, "edit-channel")

		case messageEdit := <-cs.editChatMessage:
			res := &chat.BroadcastResponse{ChatMessageEdit: messageEdit}
			cs.broadcastObject(res, "edit-message")

		case user := <-cs.newUserMessage:
			res := &chat.BroadcastResponse{User: user}
			cs.broadcastObject(res, "add-user")

		case usersList := <-cs.getUsersResponse:
			res := &chat.BroadcastResponse{Users: usersList}
			cs.broadcastObject(res, "users-list")
		}
	}
}

// Broadcast object to all clients
func (cs *chatServer) broadcastObject(res *chat.BroadcastResponse, origin string) {
	log.Println("total users", len(cs.users), cs.users)
	for _, user := range cs.users {
		err := user.stream.Send(res)
		log.Println("broadcast object to", user.name)
		if err != nil {
			log.Println("err broadcasting", err)
			user.broadcastErr <- fmt.Errorf("Unable to Broadcast %v: %v", origin, err)
		}
	}
}

func (cs *chatServer) AddChannel(ctx context.Context, req *chat.NewChannelRequest) (*chat.EmptyMessage, error) {
	res := &chat.EmptyMessage{}
	sqlStmt := `
		INSERT INTO channels(channel_name, description, channel_owner) 
		VALUES($1, $2, $3)
		RETURNING id;
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Printf("Unable to Prepare new channel insertion: %v", err)
		return nil, status.Errorf(codes.Internal, "Unable to add channel. Please try agaain later.")
	}

	var id int32
	err = stmt.QueryRow(req.Name, req.Description, req.Owner).Scan(&id)
	if err != nil {
		log.Printf("Unable to Execute new channel insertion: %v", err)
		return nil, status.Errorf(codes.Internal, "Unable to add channel. Please try agaain later.")
	}

	cs.newChannelMessage <- &chat.GetChannelsMessage{
		Description: req.Description,
		Id:          id,
		Name:        req.Name,
		Owner:       req.Owner,
	}

	return res, nil
}

func (cs *chatServer) AddMessage(ctx context.Context, req *chat.NewMessageRequest) (*chat.EmptyMessage, error) {
	db := cs.db
	sqlStmt := `
		INSERT INTO messages(user_name, channel_name, message) 
		VALUES($1, $2, $3)
		RETURNING id, post_date;
	`

	stmt, err := db.Prepare(sqlStmt)
	if err != nil {
		log.Printf("Unable to Prepare new message insertion: %v", err)
		return nil, status.Errorf(codes.Internal, "Unable to send message. Please try agaain later.")
	}

	var id int32
	var date time.Time
	err = stmt.QueryRow(req.User, req.Channel, req.Memo).Scan(&id, &date)
	if err != nil {
		errMsg := err.Error()

		switch errMsg {
		case `pq: insert or update on table "messages" violates foreign key constraint "messages_channel_name_fkey"`:
			err = status.Errorf(codes.InvalidArgument, "channel '%s' does not exist", req.Channel)
		case `pq: insert or update on table "messages" violates foreign key constraint "messages_user_name_fkey"`:
			err = status.Errorf(codes.InvalidArgument, "user '%s' does not exist", req.User)
		default:
			log.Println("Error in Execute sql for inserting new user in Register service:", err)
			err = status.Errorf(codes.Internal, "Unable to send message. Please try again later.")
		}

		return nil, err
	}

	log.Println("Message added to db")

	// query sender's avatar
	sqlStmt = `
		SELECT image_path
		FROM users 
		WHERE user_name = $1
	`

	stmt, err = cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for selecting sender's avatar:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to broadcast message. Please try again later.")
	}

	var avatar string
	err = stmt.QueryRow(req.User).Scan(&avatar)
	if err != nil {
		log.Println("Unable to Query sender's avatar:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to broadcast message. Please try again later.")
	}

	ts, err := ptypes.TimestampProto(date)
	if err != nil {
		log.Println("Unable to convert database time value to proto timestamp:", err)
		return nil, status.Errorf(codes.Internal, "Unable to add messages. Please try again later")
	}

	cs.newChatMessage <- &chat.GetMessagesMessage{
		Avatar:    fmt.Sprintf("%s:4430/%s", hostname, avatar),
		Channel:   req.Channel,
		Id:        id,
		Memo:      req.Memo,
		Timestamp: ts,
		User:      req.User,
	}

	res := &chat.EmptyMessage{}
	return res, nil
}

func (cs *chatServer) DeleteMessage(ctx context.Context, req *chat.DeleteMessageRequest) (*chat.EmptyMessage, error) {
	// validate message creator
	sqlStmt := `SELECT user_name FROM messages WHERE id = $1;`
	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for querying message data before message delete", err)
		return nil, status.Errorf(codes.Internal, "Unable to delete message. Please try again later.")
	}

	var messageCreator string
	err = stmt.QueryRow(req.Id).Scan(&messageCreator)
	if err != nil {
		log.Println("Unable to Query message data before message delete", err)
		return nil, status.Errorf(codes.Internal, "Unable to delete message. Please try again later.")
	}

	if messageCreator != req.Username {
		log.Printf("User %s is not the creator of this message. User %s is the creator.", req.Username, messageCreator)
		return nil, status.Errorf(codes.Unauthenticated, "You are not the creator of this message so you cannot delete it.")
	}

	res := &chat.EmptyMessage{}
	sqlStmt = `DELETE FROM messages WHERE id = $1;`

	stmt, err = cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for deleting message:", err)
		return res, status.Errorf(codes.Internal, "Unable to delete message. Please try again later.")
	}

	_, err = stmt.Exec(req.Id)
	if err != nil {
		log.Println("Unable to Execute message delete:", err)
		return res, status.Errorf(codes.Internal, "Unable to delete message. Please try again later.")
	}

	cs.deletedChatMessage <- &chat.DeleteMessageRequest{
		Id:       req.Id,
		Username: req.Username,
	}

	return res, nil
}

func (cs *chatServer) EditMessage(ctx context.Context, req *chat.EditMessageRequest) (*chat.EmptyMessage, error) {
	// validate message creator
	sqlStmt := `SELECT user_name FROM messages WHERE id = $1;`
	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for querying message data before message edit", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit message. Please try again later.")
	}

	var messageCreator string
	err = stmt.QueryRow(req.Id).Scan(&messageCreator)
	if err != nil {
		log.Println("Unable to Query message data before message edit", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit message. Please try again later.")
	}

	if messageCreator != req.User {
		log.Printf("User %s is not the creator of this message. User %s is the creator.", req.User, messageCreator)
		return nil, status.Errorf(codes.Unauthenticated, "You are not the creator of this message so you cannot edit it.")
	}

	res := &chat.EmptyMessage{}
	sqlStmt = `UPDATE messages
			SET 
				message = $1,
				edited = $2
			WHERE id = $3;`

	stmt, err = cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for editing message:", err)
		return res, status.Errorf(codes.Internal, "Unable to edit message. Please try again later.")
	}

	_, err = stmt.Exec(req.Memo, true, req.Id)
	if err != nil {
		log.Println("Unable to Execute message edit:", err)
		return res, status.Errorf(codes.Internal, "Unable to edit message. Please try again later.")
	}

	cs.editChatMessage <- &chat.EditMessageRequest{
		Edited: true,
		Id:     req.Id,
		Memo:   req.Memo,
	}

	return res, nil
}

func (cs *chatServer) DeleteChannel(ctx context.Context, req *chat.DeleteChannelRequest) (*chat.EmptyMessage, error) {
	// validate channel owner
	sqlStmt := `SELECT channel_name, channel_owner FROM channels WHERE id = $1;`
	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for querying channel data before channel edit", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit channel. Please try again later.")
	}

	var channelName, channelOwner string
	err = stmt.QueryRow(req.Id).Scan(&channelName, &channelOwner)
	if err != nil {
		log.Println("Unable to Query channel data before channel edit", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit channel. Please try again later.")
	}

	if channelOwner != req.Username {
		log.Printf("User %s is not the owner of channel %s. User %s is the owner.", req.Username, channelName, channelOwner)
		return nil, status.Errorf(codes.Unauthenticated, "You are not the owner of this channel so you cannot edit it.")
	}

	res := &chat.EmptyMessage{}
	sqlStmt = `DELETE FROM channels WHERE id = $1;`

	stmt, err = cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for deleting channel:", err)
		return res, status.Errorf(codes.Internal, "Unable to delete channel. Please try again later.")
	}

	_, err = stmt.Exec(req.Id)
	if err != nil {
		log.Println("Unable to Execute channel delete:", err)
		return res, status.Errorf(codes.Internal, "Unable to delete channel. Please try again later.")
	}

	cs.deletedChannel <- &chat.DeleteChannelRequest{
		Id:       req.Id,
		Name:     channelName,
		Username: req.Username,
	}

	return res, nil
}

func (cs *chatServer) EditChannel(ctx context.Context, req *chat.EditChannelRequest) (*chat.EmptyMessage, error) {
	// validate channel owner
	sqlStmt := `SELECT channel_name, channel_owner FROM channels WHERE id = $1;`
	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for querying channel data before channel edit", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit channel. Please try again later.")
	}

	var oldChannelName, channelOwner string
	err = stmt.QueryRow(req.Id).Scan(&oldChannelName, &channelOwner)
	if err != nil {
		log.Println("Unable to Query channel data before channel edit", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit channel. Please try again later.")
	}

	if channelOwner != req.Owner {
		log.Printf("User %s is not the owner of channel %s. User %s is the owner.", req.Owner, oldChannelName, channelOwner)
		return nil, status.Errorf(codes.Unauthenticated, "You are not the owner of this channel so you cannot edit it.")
	}

	// update channel data
	sqlStmt = `
		UPDATE channels
		SET channel_name = $1,
			description  = $2
		WHERE id = $3;
	`

	stmt, err = cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for editing channel:", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit channel. Please try again later.")
	}

	_, err = stmt.Exec(req.Name, req.Description, req.Id)
	if err != nil {
		log.Println("Unable to Execute channel edit:", err)
		return nil, status.Errorf(codes.Internal, "Unable to edit channel. Please try again later.")
	}

	cs.editChannelMessage <- &chat.EditChannelRequest{
		Id:          req.Id,
		Description: req.Description,
		Name:        req.Name,
		Owner:       req.Owner,
	}

	res := &chat.EmptyMessage{}
	return res, nil
}

func (cs *chatServer) GetChannels(ctx context.Context, req *chat.EmptyMessage) (*chat.GetChannelsResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	sqlStmt := `
	SELECT id, channel_name, description, channel_owner
	FROM channels
	ORDER BY id
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for selecting channels:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load channels. Please try again later.")
	}

	rows, err := stmt.Query()
	if err != nil {
		log.Println("Unable to Query channels", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load channels. Please try again later.")
	}
	defer rows.Close()

	var channels []*chat.GetChannelsMessage
	for rows.Next() {
		var channelName, channelDesc, channelOwner string
		var id int32
		err = rows.Scan(&id, &channelName, &channelDesc, &channelOwner)
		if err != nil {
			log.Println("Unable to read row returned by Query selecting channels:", err)
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

func (cs *chatServer) GetMessages(ctx context.Context, req *chat.GetMessagesRequest) (*chat.GetMessagesResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	sqlStmt := `
		SELECT 
			m.id, 
			m.channel_name, 
			m.message, 
			m.post_date, 
			m.user_name, 
			u.image_path, 
			(SELECT MIN(id) FROM messages WHERE channel_name = $1),
			m.edited
		FROM 
			messages m
		JOIN 
			users u ON u.user_name = m.user_name
		WHERE 
			m.channel_name = $2
		ORDER BY 
			m.id DESC
		LIMIT 50;
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for selecting messages:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load messages. Please try again later.")
	}

	rows, err := stmt.Query(req.Channel, req.Channel)
	if err != nil {
		log.Println("Unable to Query messages", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load messages. Please try again later.")
	}
	defer rows.Close()

	var messages []*chat.GetMessagesMessage
	var minID int32
	for rows.Next() {
		var avatar, channel, memo, username string
		var date time.Time
		var id int32
		var edited bool
		err = rows.Scan(&id, &channel, &memo, &date, &username, &avatar, &minID, &edited)
		if err != nil {
			log.Println("Unable to read row returned by Query selecting messages:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load messages. Please try again later.")
		}

		ts, err := ptypes.TimestampProto(date)
		if err != nil {
			log.Println("Unable to convert database time value to proto timestamp:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load messages. Please try again later")
		}

		message := &chat.GetMessagesMessage{
			Id:        id,
			Avatar:    fmt.Sprintf("%s:4430/%s", hostname, avatar),
			Channel:   channel,
			Timestamp: ts,
			Memo:      memo,
			User:      username,
			Edited:    edited,
		}
		messages = append(messages, message)
	}

	res := &chat.GetMessagesResponse{
		Messages: messages,
		MinId:    minID,
	}
	return res, nil
}

func (cs *chatServer) GetFilteredMessages(ctx context.Context, req *chat.GetFilteredMessagesRequest) (*chat.GetMessagesResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	sqlStmt := `
		SELECT m.id, m.channel_name, m.message, m.post_date, m.user_name, u.image_path, (SELECT MIN(id) FROM messages WHERE channel_name = $1)
		FROM messages m
		JOIN users u ON u.user_name = m.user_name
		WHERE 
			m.channel_name = $2
			AND m.id < $3
		ORDER BY m.id DESC
		LIMIT 30;
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for selecting messages:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load messages. Please try again later.")
	}

	rows, err := stmt.Query(req.Channel, req.Channel, int(req.MinId))
	if err != nil {
		log.Println("Unable to Query messages", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load messages. Please try again later.")
	}
	defer rows.Close()

	var messages []*chat.GetMessagesMessage
	var minID int32
	for rows.Next() {
		var avatar, channel, memo, username string
		var date time.Time
		var id int32
		err = rows.Scan(&id, &channel, &memo, &date, &username, &avatar, &minID)
		if err != nil {
			log.Println("Unable to read row returned by Query selecting messages:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load messages. Please try again later.")
		}

		ts, err := ptypes.TimestampProto(date)
		if err != nil {
			log.Println("Unable to convert database time value to proto timestamp:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load messages. Please try again later")
		}

		message := &chat.GetMessagesMessage{
			Id:        id,
			Avatar:    fmt.Sprintf("%s:4430/%s", hostname, avatar),
			Channel:   channel,
			Timestamp: ts,
			Memo:      memo,
			User:      username,
		}
		messages = append(messages, message)
	}

	res := &chat.GetMessagesResponse{
		Messages: messages,
		MinId:    minID,
	}
	return res, nil
}

func (cs *chatServer) GetUsers(ctx context.Context, req *chat.EmptyMessage) (*chat.GetUsersResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request")
	}

	// get string list of user names currently logged in
	var usersNameList []string
	for _, user := range cs.users {
		usersNameList = append(usersNameList, user.name)
	}

	sqlStmt := `
		SELECT id, user_name, image_path
		FROM users
		WHERE user_name = ANY($1)
	`

	stmt, err := cs.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for selecting users:", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load users. Please try again later.")
	}

	rows, err := stmt.Query(pq.Array(usersNameList))
	if err != nil {
		log.Println("Unable to Query users", err)
		return nil, status.Errorf(codes.Unavailable, "Unable to load users. Please try again later.")
	}
	defer rows.Close()

	var users []*chat.GetUsersMessage
	var count int
	for rows.Next() {
		count++
		var username, avatar string
		var id int32
		err = rows.Scan(&id, &username, &avatar)
		if err != nil {
			log.Println("Unable to read row returned by Query selecting users:", err)
			return nil, status.Errorf(codes.Internal, "Unable to load users. Please try again later.")
		}

		user := &chat.GetUsersMessage{
			Id:     id,
			Name:   username,
			Avatar: fmt.Sprintf("%s:4430/%s", hostname, avatar),
		}
		users = append(users, user)
	}
	log.Println("returning users list of size", count)

	res := &chat.GetUsersResponse{Users: users}
	return res, nil
}
