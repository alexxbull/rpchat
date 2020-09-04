package main

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	auth "github.com/alexxbull/rpchat/backend/proto/auth"
	chat "github.com/alexxbull/rpchat/backend/proto/chat"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type authServer struct {
	db *sql.DB
}

func (as *authServer) Login(ctx context.Context, req *auth.LoginRequest) (*auth.LoginResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request.")
	}

	// validate user
	sqlStmt := `
		SELECT user_password, id, image_path 
		FROM users 
		WHERE user_name = $1
	`

	stmt, err := as.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Error in Prepare sql for querying user's password in Login service:", err)
		return nil, status.Errorf(codes.Internal, "Unable to login. Please check your login information.")
	}

	var avatar, dbPasswordHash string
	var id int32
	err = stmt.QueryRow(req.Username).Scan(&dbPasswordHash, &id, &avatar)
	if err != nil {
		errMsg := err.Error()

		switch errMsg {
		case `sql: no rows in result set`:
			err = status.Errorf(codes.InvalidArgument, "No account has been registered with this username.")
		default:
			log.Println(err)
			err = status.Errorf(codes.Internal, "Unable to login. Please check your login information.")
		}

		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(dbPasswordHash), []byte(req.Password))
	if err != nil {
		return nil, status.Errorf(codes.FailedPrecondition, "Invalid password.")
	}

	accessToken, refreshToken, err := generateTokens(req.Username)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Unable to make authentication tokens for user %s.", req.Username)
	}

	// store refresh token in db
	sqlStmt = `UPDATE users
			   SET refresh_token = $1
			   WHERE user_name = $2`

	stmt, err = as.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Error in Prepare sql updating refresh token in Login service:", err)
		return nil, status.Errorf(codes.Internal, "Unable to store authentication tokens. Please try again later.")
	}

	_, err = stmt.Exec(refreshToken, req.Username)
	if err != nil {
		log.Println("Error in Execute sql updating refresh token in Login service:", err)
		return nil, status.Errorf(codes.Internal, "Unable to store authentication tokens. Please try again later.")
	}

	// broadcast user has logged in
	avatarPath := fmt.Sprintf("%s:4430/%s", hostname, avatar)
	chatSrvr.newUserMessage <- &chat.GetUsersMessage{
		Avatar: avatarPath,
		Id:     id,
		Name:   req.Username,
	}

	// store refresh token in a HttpOnly cookie
	cookie := http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Expires:  time.Now().Add(refreshTokenDuration),
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}

	// attach cookie to response header
	header := metadata.Pairs("set-cookie", cookie.String())
	grpc.SendHeader(ctx, header)

	res := &auth.LoginResponse{
		AccessToken: accessToken,
		Avatar:      avatarPath,
	}

	return res, nil
}

func (as *authServer) Register(ctx context.Context, req *auth.RegisterRequest) (*auth.LoginResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request.")
	}

	// hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Unable to hash password for user", req.Username)
		return nil, status.Errorf(codes.InvalidArgument, "Invalid password.")
	}

	// add user to database
	sqlStmt := `
		INSERT INTO users(email, user_name, user_password, image_path, refresh_token)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id;
	`

	stmt, err := as.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Error in Prepare sql for inserting new user in Register service:", err)
		return nil, status.Errorf(codes.Internal, "Unable to register account. Please check your registration information.")
	}

	accessToken, refreshToken, err := generateTokens(req.Username)
	if err != nil {
		log.Printf("Unable to make tokens for user %s: %s \n", req.Username, err.Error())
		return nil, status.Errorf(codes.Internal, "Unable to make tokens for user %s. Please try again later.", req.Username)
	}

	// add user to database
	var id int32
	avatar := "attachments/default/user-icon.svg" // default avatar for new users
	err = stmt.QueryRow(req.Email, req.Username, passwordHash, avatar, refreshToken).Scan(&id)
	if err != nil {
		errMsg := err.Error()

		switch errMsg {
		case `pq: duplicate key value violates unique constraint "users_email_key"`:
			err = status.Errorf(codes.InvalidArgument, "An account is already registered with this email")
		case `pq: duplicate key value violates unique constraint "users_user_name_key"`:
			err = status.Errorf(codes.InvalidArgument, "This username is already taken")
		default:
			log.Println("Error in Execute sql for inserting new user in Register service:", err)
			err = status.Errorf(codes.Internal, "Unable to register account. Please try again later.")
		}

		return nil, err
	}

	// broadcast user has logged in
	avatarPath := fmt.Sprintf("%s:4430/%s", hostname, avatar)
	chatSrvr.newUserMessage <- &chat.GetUsersMessage{
		Avatar: avatarPath,
		Id:     id,
		Name:   req.Username,
	}

	// store refresh token in a HttpOnly cookie
	cookie := http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Expires:  time.Now().Add(refreshTokenDuration),
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}

	// attach cookie to response header
	header := metadata.Pairs("set-cookie", cookie.String())
	grpc.SendHeader(ctx, header)

	res := &auth.LoginResponse{
		AccessToken: accessToken,
		Avatar:      avatarPath,
	}

	return res, nil
}

func (as *authServer) Refresh(ctx context.Context, req *auth.EmptyMessage) (*auth.LoginResponse, error) {
	if req == nil {
		return nil, status.Errorf(codes.InvalidArgument, "Empty request.")
	}

	// extract refresh token from cookie
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Errorf(codes.InvalidArgument, "Metadata not provided.")
	}

	cookies, ok := md["cookie"]
	if !ok || len(cookies) == 0 {
		return nil, status.Errorf(codes.InvalidArgument, "Missing cookies.")
	}

	var refreshToken string
	for _, cookie := range cookies {
		if strings.HasPrefix(cookie, "refresh_token") {
			refreshTokenString := strings.Split(cookie, "=")
			log.Println("rts found:", refreshTokenString)
			if len(refreshTokenString) == 2 {
				refreshToken = refreshTokenString[1]
				break
			}
		}
	}

	if refreshToken == "" {
		return nil, status.Errorf(codes.InvalidArgument, "Refresh token not provided.")
	}

	// validate refresh token
	token, err := verifyToken(refreshToken)
	if err != nil {
		log.Println("Invalid refresh token", err)
		return nil, err
	}

	// return new tokens for the authenticated user
	userClaim, ok := token.Claims.(*userClaims)
	if !ok {
		log.Println("Unable to parse claims:", err)
		return nil, status.Errorf(codes.Internal, "Unable to update token for session. Please try again later.")
	}

	accessToken, _, err := generateTokens(userClaim.Username)
	if err != nil {
		log.Printf("Unable to make tokens for user %s: %s \n", userClaim.Username, err.Error())
		return nil, status.Errorf(codes.Internal, "Unable to make tokens for user %s. Please try again later.", userClaim.Username)
	}

	// get user's avatar owner
	sqlStmt := `SELECT image_path FROM users WHERE user_name = $1;`
	stmt, err := as.db.Prepare(sqlStmt)
	if err != nil {
		log.Println("Unable to Prepare sql for querying user's avatar before sending access token", err)
		return nil, status.Errorf(codes.Internal, "Unable to generate access token. Please try again later.")
	}

	var avatar string
	err = stmt.QueryRow(userClaim.Username).Scan(&avatar)
	if err != nil {
		log.Println("Unable to Query user's avatar before sending access token", err)
		return nil, status.Errorf(codes.Internal, "Unable to generate access token. Please try again later.")
	}

	avatarPath := fmt.Sprintf("%s:4430/%s", hostname, avatar)
	res := &auth.LoginResponse{
		AccessToken: accessToken,
		Avatar:      avatarPath,
	}

	return res, nil
}
