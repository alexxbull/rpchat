import { ChatServicePromiseClient } from '../proto/chat/chat_grpc_web_pb.js'
import { AuthServicePromiseClient } from '../proto/auth/auth_grpc_web_pb.js'
import { AuthUnaryInterceptor } from '../interceptors/AuthUnaryInterceptor.js'

const hostname = 'https://localhost:443'
const authUnaryInterceptor = new AuthUnaryInterceptor()

const chatOpts = {
    'unaryInterceptors': [authUnaryInterceptor],
}
const ChatClient = new ChatServicePromiseClient(hostname, null, chatOpts)

const authOpts = {
    'unaryInterceptors': [authUnaryInterceptor],
    'withCredentials': true,
}
const AuthClient = new AuthServicePromiseClient(hostname, null, authOpts)

export { ChatClient, AuthClient }