# RPChat
A web chat application powered by gRPC for realtime communication.

## Website
https://rpchat.netlify.app/

[![Netlify Status](https://api.netlify.com/api/v1/badges/408bf433-5f94-4c6f-8a36-8d474a01b836/deploy-status)](https://app.netlify.com/sites/rpchat/deploys)

## Features
- Realtime chat
- Create, edit, and delete Channels
- Create, edit, and delete Messages
- JWT support for authentication
- Docker support

# Frontend 
- Written in React
- gRPC support via grpc-web
- Responsive (mobile and desktop support)

# Backend
- Written in Go
- gRPC unary support for other client/server communication
- gRPC server streaming support for broadcasting messages and updates

### Screenshots
Mobile
<div style="display:flex; justify-content:space-evenly;">
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/home-mobile.png" width=250px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/main-mobile.png" width=250px/>  
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/message-options-mobile.png" width=250px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/channels-mobile.png" width=250px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/settings-mobile.png" width=250px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/users-mobile.png" width=250px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/about-mobile.png" width=250px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/users-mobile.png" width=250px/>
</div> 

Desktop
<div style="display:flex;">
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/home-desktop.png" width=300px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/main-desktop.png" width=350px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/message-options-desktop.png" width=350px/>
<img src="https://github.com/alexxbull/rpchat/blob/master/screenshots/about-desktop.png" width=350px/>
</div> 

# Useful commands:
* Compile protobufs for frontend (assumes working directory is the root directory `rpchat`)
     ```
        protoc chat.proto \
            --js_out=import_style=commonjs:frontend/src/proto/chat \
            --grpc-web_out=import_style=commonjs,mode=grpcwebtext:frontend/src/proto/chat
            
        protoc auth.proto \
            --js_out=import_style=commonjs:frontend/src/proto/auth \
            --grpc-web_out=import_style=commonjs,mode=grpcwebtext:frontend/src/proto/auth
    ```
