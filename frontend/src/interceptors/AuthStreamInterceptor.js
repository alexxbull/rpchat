class AuthStreamInterceptor {
    #dispatch
    constructor(dispatch) {
        this.#dispatch = dispatch
    }

    intercept = async (request, invoker) => {
        try {
            // validate user's access token            
            const md = request.getMetadata()
            md['authorization'] = `Bearer ${window.accessToken || ''}`
            return await invoker(request)
        }
        catch (err) {
            console.error('stream int req err', err.message)
        }
    }
}

export { AuthStreamInterceptor }