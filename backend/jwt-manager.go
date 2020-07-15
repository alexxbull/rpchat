package main

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

var (
	accessSecretKey     = os.Getenv("JWT_ACCESS_SECRET")
	accessTokenDuration = 25 * time.Second
	// accessTokenDuration  = 10 * time.Minute // 10 minutes
	refreshSecretKey     = os.Getenv("JWT_REFRESH_SECRET")
	refreshTokenDuration = 14 * (24 * time.Hour) // 14 days
	ignoredRoutes        = []string{
		"/auth.AuthService/Login",
		"/auth.AuthService/Refresh",
		"/auth.AuthService/Register",
		"/chat.ChatService/Broadcast",
	}
)

type userClaims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func generateTokens(username string) (string, string, error) {
	accessClaims := userClaims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(accessTokenDuration).Unix(),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(accessSecretKey))
	if err != nil {
		fmt.Println("Unable to sign token:", err)
		return "", "", status.Errorf(codes.Internal, "unable to sign token: %v", err)
	}

	refreshClaims := userClaims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(refreshTokenDuration).Unix(),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(refreshSecretKey))
	if err != nil {
		return "", "", status.Errorf(codes.Internal, "unable to sign token: %v", err)
	}

	return accessTokenString, refreshTokenString, nil
}

func verifyToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&userClaims{},
		func(tkn *jwt.Token) (interface{}, error) {
			// validate HMAC-SHA algorithm is used
			if _, ok := tkn.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, status.Errorf(codes.Unauthenticated, "unexpected signing method: %v", tkn.Header["alg"])
			}

			return []byte(accessSecretKey), nil
		},
	)

	if err != nil {
		if ve, ok := err.(*jwt.ValidationError); ok {
			fmt.Println("ve", ve.Errors)
			switch {
			// malformed token provided
			case ve.Errors&(jwt.ValidationErrorMalformed|jwt.ValidationErrorNotValidYet) != 0:
				return nil, status.Errorf(codes.Unauthenticated, "invalid token")
			case ve.Errors&(jwt.ValidationErrorExpired) != 0:
				// token has expired
				return nil, status.Errorf(codes.Unauthenticated, "expired token")
			}
		} else {
			return nil, status.Errorf(codes.Unauthenticated, "Couldn't handle this token: %v", err)
		}
	}

	return token, nil
}

func authenticate(ctx context.Context, method string) error {
	// skip authentication if requested service is public
	for _, service := range ignoredRoutes {
		if service == method {
			return nil
		}
	}

	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return status.Errorf(codes.FailedPrecondition, "metadata not provided")
	}

	var tokenString string
	accessToken := md["authorization"]
	if len(accessToken) == 0 {
		return status.Errorf(codes.FailedPrecondition, "token not provided")
	}

	tokenString = accessToken[0]
	if strings.HasPrefix(tokenString, "Bearer ") {
		tokenString = strings.Split(tokenString, "Bearer ")[1]
		fmt.Println("at", tokenString)
	} else if tokenString == "Bearer" {
		return status.Errorf(codes.FailedPrecondition, "missing access token")
	} else {
		return status.Errorf(codes.Unauthenticated, "invalid token")
	}

	_, err := verifyToken(tokenString)
	if err != nil {
		return err
	}

	return nil
}
