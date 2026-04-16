import { createClient } from "@connectrpc/connect";
// import { createConnectTransport } from "@connectrpc/connect-web";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { AuthService } from "../proto/auth/auth_pb.js";
import { ChatService } from "../proto/chat/chat_pb.js";

const hostname = import.meta.env.VITE_RPCHAT_SERVER_HOST || 'https://localhost:443';

// Simplified Interceptor for Connect v2
const createAuthInterceptor = (dispatch) => (next) => async (req) => {
    // Add your logic here (e.g. headers)
    return await next(req);
};

const AuthClient = (dispatch) => {
    const transport = createGrpcWebTransport({
        baseUrl: hostname,
        credentials: "include",
        interceptors: [createAuthInterceptor(dispatch)],
    });

    // Use createClient, NOT new AuthServicePromiseClient
    return createClient(AuthService, transport);
};

const ChatClient = (dispatch) => {
    const transport = createGrpcWebTransport({
        baseUrl: hostname,
        credentials: "include",
        interceptors: [createAuthInterceptor(dispatch)],
    });

    return createClient(ChatService, transport);
};

export { AuthClient, ChatClient };