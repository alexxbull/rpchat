import { ChatServicePromiseClient } from '../proto/chat/chat_grpc_web_pb.js'
import { AuthServicePromiseClient } from '../proto/auth/auth_grpc_web_pb.js'
import { AuthUnaryInterceptor } from '../interceptors/AuthUnaryInterceptor.js'

const hostname = 'https://localhost:443'

const AuthClient = dispatch => {
    const authUnaryInterceptor = new AuthUnaryInterceptor(dispatch)

    const authOpts = {
        'unaryInterceptors': [authUnaryInterceptor],
        'withCredentials': true,
    }

    return new AuthServicePromiseClient(hostname, null, authOpts)
}

const ChatClient = dispatch => {
    const authUnaryInterceptor = new AuthUnaryInterceptor(dispatch)

    const chatOpts = {
        'unaryInterceptors': [authUnaryInterceptor],
    }

    return new ChatServicePromiseClient(hostname, null, chatOpts)
}


export { AuthClient, ChatClient }