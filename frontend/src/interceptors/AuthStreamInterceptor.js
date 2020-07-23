class AuthStreamInterceptor {
    #dispatch
    constructor(dispatch) {
        this.#dispatch = dispatch
    }

    intercept = async (request, invoker) => {
        const route = request['b']['name']
        if (route === '/chat.ChatService/Broadcast')
            console.log('route', route)

        try {
            // validate user's access token            
            const md = request.getMetadata()
            md['authorization'] = `Bearer ${window.accessToken || ''}`
            const res = await invoker(request)

            // return new StreamInterceptor(res, this.#dispatch)
            // return invoker(request)
            return res
        }
        catch (err) {
            console.error('stream int req err', err)
        }
    }
}

export { AuthStreamInterceptor }