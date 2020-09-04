import jwtDecode from 'jwt-decode'

// grpc
import { AuthClient } from '../client/grpc_clients.js'
import { EmptyMessage } from '../proto/auth/auth_pb.js'

const authRoutes = ['/auth.AuthService/Login', '/auth.AuthService/Refresh', '/auth.AuthService/Register']

class AuthUnaryInterceptor {
    #dispatch
    constructor(dispatch) {
        this.#dispatch = dispatch
    }

    intercept = async (request, invoker) => {
        const route = request.getMethodDescriptor().name

        try {
            let response = null
            if (authRoutes.includes(route)) {
                // intercept auth service routes and store the access token returned from these requests
                response = await invoker(request)
                const responseMessage = response.getResponseMessage()
                const avatar = responseMessage.getAvatar()
                window.accessToken = responseMessage.getAccessToken()

                const decodedToken = jwtDecode(window.accessToken)
                const username = decodedToken.username
                this.#dispatch({ type: 'logged-in', payload: { avatar: avatar, username: username } })
            } else {
                // validate user's access token            
                const md = request.getMetadata()
                md['authorization'] = `Bearer ${window.accessToken || ''}`
                response = await invoker(request)
            }
            return response;
        }
        catch (err) {
            if (err.message === 'expired token' || err.message === 'missing access token') {
                try {
                    const tokenRequest = new EmptyMessage()
                    const authClient = AuthClient(null)
                    const refreshResponse = await authClient.refresh(tokenRequest, {})
                    const avatar = refreshResponse.getAvatar()
                    window.accessToken = refreshResponse.getAccessToken()

                    const decodedToken = jwtDecode(window.accessToken)
                    const username = decodedToken.username
                    this.#dispatch({ type: 'logged-in', payload: { avatar: avatar, username: username } })

                    // send initial request with updated access token
                    const md = request.getMetadata()
                    md['authorization'] = `Bearer ${window.accessToken || ''}`

                    return invoker(request)
                }
                catch (err) {
                    // return error from validating refresh token
                    console.error('token refresh err', err.message)
                    return Promise.reject(err)
                }
            } else {
                return Promise.reject(err)
            }
        }
    }
}

export { AuthUnaryInterceptor }