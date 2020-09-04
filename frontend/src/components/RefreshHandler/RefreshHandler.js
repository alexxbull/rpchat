import { useContext, useEffect } from 'react'

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { BroadcastRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store'

const RefreshHandler = props => {
    const { dispatch, state } = useContext(StoreContext)

    // handle page refresh
    useEffect(() => {
        const onUnload = event => {
            event.preventDefault()

            const handleDisconnect = async () => {
                // close connection with server
                const chatClient = ChatClient(dispatch)
                const req = new BroadcastRequest()
                req.setUsername(state.username)
                await chatClient.closeBroadcast(req, {})

                // open a new broadcast listener if user stays on page
                setTimeout(() => {
                    dispatch({ type: 'set-listening', payload: false })
                }, 100)
            }
            handleDisconnect()
        }

        window.addEventListener('beforeunload', onUnload)
        return () => window.removeEventListener("beforeunload", onUnload)

    }, [dispatch, state.username])

    return null
}

export default RefreshHandler