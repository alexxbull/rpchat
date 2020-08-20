import { ChatServicePromiseClient } from '../proto/chat/chat_grpc_web_pb.js'
import { AuthServicePromiseClient } from '../proto/auth/auth_grpc_web_pb.js'
import { AuthUnaryInterceptor } from '../interceptors/AuthUnaryInterceptor.js'
import { AuthStreamInterceptor } from '../interceptors/AuthStreamInterceptor.js'

const hostname = process.env.REACT_APP_GRPC_SERVER_HOST || 'https://localhost:443'
console.log('hostname', hostname);

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
    const authStreamInterceptor = new AuthStreamInterceptor(dispatch)

    const chatOpts = {
        'unaryInterceptors': [authUnaryInterceptor],
        'streamInterceptors': [authStreamInterceptor],
        'withCredentials': true,
    }

    return new ChatServicePromiseClient(hostname, null, chatOpts)
}


export { AuthClient, ChatClient }