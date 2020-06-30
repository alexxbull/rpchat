import { AuthClient } from '../client/grpc_clients.js'
import { EmptyMessage } from '../proto/auth/auth_pb.js'

let accessToken = ''

// dyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ld1VzZXIiLCJleHAiOjE1OTM0MTYzOTV9.UuxN8iu5SKyFxnszTmXAMu7xn8Q3I6GsUhtyKnQK1lU

// const route = request['b']['name']
// if (ignoredRoutes.includes(route)) {
//     return invoker(request)
// }

const ignoredRoutes = ['/auth.AuthService/Refresh']
const accessTokenRoutes = ['/auth.AuthService/Login', '/auth.AuthService/Register']

class AuthUnaryInterceptor {
    intercept = async (request, invoker) => {
        const route = request['b']['name']
        if (ignoredRoutes.includes(route)) {
            return invoker(request)
        }

        try {
            let response = null
            if (accessTokenRoutes.includes(route)) {
                // intercept Login and Register requests and store the access token returned
                response = await invoker(request)
                accessToken = response['P'].getToken().getAccessToken()
            } else {
                // validate user's access token            
                const md = request.getMetadata()
                md['authorization'] = `Bearer ${accessToken}`
                response = await invoker(request)
            }
            return response;
        } catch (err) {
            if (err.message === 'expired token' || err.message === 'missing access token') {
                try {
                    const tokenRequest = new EmptyMessage()
                    const refreshResponse = await AuthClient.refresh(tokenRequest, {})
                    accessToken = refreshResponse.getAccessToken()

                    // send initial request with updated access token
                    request['c'] = {
                        ...request['c'],
                        'authorization': 'Bearer ' + accessToken
                    }

                    return invoker(request)
                }
                catch (err) {
                    // return error from validating refresh token
                    console.log('ref err', err)
                    return Promise.reject(err)
                }
            } else {
                return Promise.reject(err)
            }
        }
    };
}

export { AuthUnaryInterceptor }