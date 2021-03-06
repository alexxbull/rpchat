// grpc
import { BroadcastRequest } from '../../proto/chat/chat_pb.js'
import { ChatClient } from '../../client/grpc_clients.js'

const broadcastListener = async (username, dispatch) => {
    try {
        const req = new BroadcastRequest()
        req.setUsername(username)

        const chatClient = ChatClient(dispatch)
        const stream = await chatClient.broadcast(req, {})

        stream.on('data', (res) => {
            switch (true) {
                case res.hasChannel():
                    const channel = res.getChannel()
                    const newChannel = {
                        id: channel.getId(),
                        name: channel.getName(),
                        desc: channel.getDescription(),
                        owner: channel.getOwner(),
                        active: false,
                    }
                    dispatch({ type: 'add-channel', payload: newChannel })
                    break
                case res.hasChannelEdit():
                    const channelEdit = res.getChannelEdit()
                    const editedChannel = {
                        desc: channelEdit.getDescription(),
                        id: channelEdit.getId(),
                        name: channelEdit.getName(),
                    }
                    dispatch({ type: 'edit-channel', payload: editedChannel })
                    break
                case res.hasChannelDeleted():
                    const channelDeleted = res.getChannelDeleted()
                    const deletedChannel = {
                        id: channelDeleted.getId(),
                        name: channelDeleted.getName(),
                    }
                    dispatch({ type: 'deleted-channel', payload: deletedChannel })
                    break
                case res.hasChatMessage():
                    const message = res.getChatMessage()
                    const newMessage = {
                        avatar: message.getAvatar(),
                        channel: message.getChannel(),
                        id: message.getId(),
                        memo: message.getMemo(),
                        timestamp: message.getTimestamp().toDate(),
                        username: message.getUser(),
                    }
                    dispatch({ type: 'add-message', payload: newMessage })
                    break
                case res.hasChatMessageDeleted():
                    const messageDeleted = res.getChatMessageDeleted()
                    const deletedMessage = {
                        id: messageDeleted.getId(),
                    }
                    dispatch({ type: 'deleted-message', payload: deletedMessage })
                    break
                case res.hasChatMessageEdit():
                    const messageEdit = res.getChatMessageEdit()
                    const editedMessage = {
                        id: messageEdit.getId(),
                        memo: messageEdit.getMemo(),
                        edited: messageEdit.getEdited(),
                    }
                    dispatch({ type: 'edit-message', payload: editedMessage })
                    break
                case res.hasUser():
                    const user = res.getUser()
                    const newUser = {
                        avatar: user.getAvatar(),
                        id: user.getId(),
                        name: user.getName(),
                    }
                    dispatch({ type: 'add-user', payload: newUser })
                    break
                case res.hasUsers():
                    const usersList = res.getUsers().getUsersList().map(user => {
                        return {
                            id: user.getId(),
                            name: user.getName(),
                            avatar: user.getAvatar()
                        }
                    })
                    dispatch({ type: 'set-users', payload: usersList })
                    break
                default:
                    // set listening to to true if successfully connected to broadcast stream
                    if (res.getConnected())
                        dispatch({ type: 'set-listening', payload: true })
                    break
            }
        })

        stream.on('status', (status) => {
            if (status.details === 'Http response at 400 or 500 level')
                console.error('Connection lost with server')
        })

        stream.on('end', end => {
            // stream end signal
            console.warn('stream end', end)
        })

    }
    catch (err) {
        console.error('broadcast error:', err.message)
    }
}

export { broadcastListener }