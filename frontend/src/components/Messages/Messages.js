import React, { useContext, useEffect } from 'react';

import classes from './Messages.module.css';

import moment from 'moment'

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { GetMessagesRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store';

// components
import Message from './Message/Message';

const Messages = props => {
    const { dispatch, state } = useContext(StoreContext)

    // load messages after initial render
    useEffect(() => {
        // load messages
        (
            async () => {
                try {
                    const req = new GetMessagesRequest()
                    req.setChannel(state.currentChannel.name)

                    const chatClient = ChatClient(dispatch)
                    const res = await chatClient.getMessages(req, {})
                    const newMessages = res.getMessagesList().map(message => {
                        return {
                            avatar: message.getAvatar(),
                            channel: message.getChannel(),
                            id: message.getId(),
                            memo: message.getMemo(),
                            timestamp: message.getTimestamp().toDate(),
                            username: message.getUser(),
                        }
                    })
                    dispatch({ type: 'set-messages', payload: newMessages })
                } catch (err) {
                    console.error('error loading messages:', err.message)
                    // send to 404 page
                }
            }
        )()
    }, [dispatch, state.currentChannel])

    return (
        <div className={classes.Messages}>
            {
                state.messages.map((message, index) => {
                    if (index > 0) {
                        const prevMessage = state.messages[index - 1]
                        const messageDate = moment(message.timestamp).format('L').toString
                        const prevMessageDate = moment(prevMessage.timestamp).format('L').toString

                        // group consecutive messages from the same user on the same day
                        if (message.username === prevMessage.username && messageDate === prevMessageDate) {
                            return <Message
                                group={true}
                                key={message.id}
                                memo={message.memo}
                                timestamp={moment(message.timestamp).format('L').toString()}
                                username={message.username}
                                avatar={message.avatar}
                            />
                        }
                    }

                    // do not group this message
                    return <Message
                        group={false}
                        key={message.id}
                        memo={message.memo}
                        timestamp={moment(message.timestamp).format('L').toString()}
                        username={message.username}
                        avatar={message.avatar}
                    />
                })
            }
        </div>
    )
}

export default Messages;