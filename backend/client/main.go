package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	auth "github.com/alexxbull/rpchat/backend/proto/auth"
	chat "github.com/alexxbull/rpchat/backend/proto/chat"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

const addr = "localhost:443"

var (
	refreshToken string
	accessToken  string
)

func main() {
	// add tls
	var opts []grpc.DialOption
	creds, err := credentials.NewClientTLSFromFile("../cert.pem", "localhost")
	if err != nil {
		log.Fatalf("Unable to load credential file: %v", err)
	}
	opts = append(opts, grpc.WithTransportCredentials(creds))

	authConn, err := grpc.Dial(addr, opts...)

	if err != nil {
		log.Fatalf("Unable to connect to %v: %v", addr, err)
	}

	accessToken, refreshToken, err = login(authConn)
	if err != nil {
		log.Fatalln("Unable to log in to server:", err)
	}
	accessToken = "Bearer " + accessToken

	// add unary intercepter
	opts = append(opts, grpc.WithUnaryInterceptor(unaryIntercepter(accessToken, refreshToken)))

	// add stream intercepter
	opts = append(opts, grpc.WithStreamInterceptor(streamIntercepter(accessToken, refreshToken)))

	chatConn, err := grpc.Dial(addr, opts...)
	if err != nil {
		log.Fatalf("Unable to connect to %v: %v", addr, err)
	}

	go broadcastListen(chatConn)
	sendMessageShell(chatConn)
}

func unaryIntercepter(accessToken, refreshToken string) grpc.UnaryClientInterceptor {
	return func(
		ctx context.Context,
		method string,
		req, reply interface{},
		cc *grpc.ClientConn,
		invoker grpc.UnaryInvoker,
		opts ...grpc.CallOption,
	) error {
		fmt.Println("--> unary interceptor:", method)

		md := metadata.AppendToOutgoingContext(ctx, "authorization", accessToken, "refresh_token", refreshToken)

		return invoker(md, method, req, reply, cc, opts...)
	}
}

func streamIntercepter(accessToken, refreshToken string) grpc.StreamClientInterceptor {
	return func(
		ctx context.Context,
		desc *grpc.StreamDesc,
		cc *grpc.ClientConn,
		method string,
		streamer grpc.Streamer,
		opts ...grpc.CallOption,
	) (grpc.ClientStream, error) {
		fmt.Println("--> stream interceptor:", method)

		md := metadata.AppendToOutgoingContext(ctx, "authorization", accessToken, "refresh_token", refreshToken)

		return streamer(md, desc, cc, method, opts...)
	}
}

func login(conn grpc.ClientConnInterface) (string, string, error) {
	client := auth.NewAuthServiceClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req := &auth.LoginRequest{
		Username: "newUser",
		Password: "newUser",
	}

	var header metadata.MD
	fmt.Println("blank md", header)
	res, err := client.Login(ctx, req, grpc.Header(&header))
	if err != nil {
		return "", "", err
	}

	// extract refresh token from cookie
	fmt.Println("header", header)
	if header == nil {
		return "", "", status.Errorf(codes.FailedPrecondition, "metadata not provided")
	}

	cookies, ok := header["set-cookie"]
	if !ok || len(cookies) == 0 {
		return "", "", status.Errorf(codes.FailedPrecondition, "missing cookies")
	}

	var refreshToken string
	for _, cookie := range cookies {
		if strings.HasPrefix(cookie, "refresh_token") {
			refreshToken = strings.Split(cookie, "=")[1]
			break
		}
	}
	if refreshToken == "" {
		return "", "", status.Errorf(codes.FailedPrecondition, "refresh token not provided")
	}

	return res.Token.AccessToken, refreshToken, nil
}

func broadcastListen(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.EmptyMessage{}

	stream, err := client.Broadcast(ctx, req)
	if err != nil {
		log.Fatalln("Unable to receive broadcast from server: %w", err)
	}

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
			user := msg.User
			fmt.Printf("%v @ on %v: %v\n", user, channel, message)

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
			Channel: "TestChannel",
			Memo:    message,
			User:    "TestUser",
		}

		res, err := client.AddMessage(ctx, req)
		if err != nil {
			log.Fatalln("Response error from server:", err)
		}

		fmt.Printf("Messaged added with id %v @ %v:", res.Id, res.PostDate)
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

	res, err := client.AddMessage(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}
	fmt.Println("Message id:", res.Id, "Post Date:", res.PostDate)
}

func addChannel(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.NewChannelRequest{
		Name:        "TestChannel",
		Description: "Test channel made by TestUser",
		Owner:       "TestUser",
	}

	_, err := client.AddChannel(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}
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

	_, err := client.AddUser(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

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

func editChannel(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.EditChannelRequest{
		OldName:     "NewTesterChannel",
		NewName:     "UpdatedChannel",
		Description: "Updated channel description",
	}

	_, err := client.EditChannel(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("Channel updated")
}

func editUser(conn grpc.ClientConnInterface) {
	client := chat.NewChatServiceClient(conn)
	ctx := context.Background()
	req := &chat.EditUserRequest{
		Email:       "updated@email.com",
		Name:        "UpdatedTester",
		OldName:     "NewTester",
		OldPassword: "password",
		Password:    "newpassword",
	}

	_, err := client.EditUser(ctx, req)
	if err != nil {
		log.Fatalln("Response error from server:", err)
	}

	fmt.Println("User updated")
}
