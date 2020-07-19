import React, { Component } from 'react';

import classes from './Messages.module.css';

import moment from 'moment'

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { GetFilteredMessagesRequest, GetMessagesRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store';

// components
import Message from './Message/Message';
import Spinner from '../Spinner/Spinner';

class Messages extends Component {
    static contextType = StoreContext

    messagesEndRef = React.createRef()
    messagesRef = React.createRef()
    observer = React.createRef()

    state = {
        clientMin: 0,
        currentChannel: this.context.state.currentChannel,
        hasMore: false,
        loading: false,
        messages: this.context.state.messages,
        serverMin: 0,
    }

    // load messages after initial render
    componentDidMount() {
        this.loadMessages()
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        // capture the scroll position so we can adjust scroll later if new messages were added.
        if (this.state.messages.length > prevState.messages.length && this.messagesRef) {
            const messagesJSX = this.messagesRef.current;
            return messagesJSX.scrollHeight
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // update when global store's currentChannel is updated
        const storeCurrentChannel = this.context.state.currentChannel
        if (this.state.currentChannel.name !== storeCurrentChannel.name) {
            this.setState({ currentChannel: storeCurrentChannel })
        }

        // update when currentChannel is updated
        if (this.state.currentChannel.name !== prevState.currentChannel.name)
            this.loadMessages()


        // update when global store's messages is updated
        const storeMessages = this.context.state.messages
        if (this.state.messages !== storeMessages) {
            this.setState({ messages: storeMessages })
        }

        // adjust scroll so the new messages don't push the old ones out of view.
        if (snapshot !== null) {
            const messagesJSX = this.messagesRef.current;
            messagesJSX.scrollTop = messagesJSX.scrollHeight - snapshot + messagesJSX.scrollTop;
        }
    }

    loadMessages = async () => {
        const { dispatch } = this.context
        const { currentChannel } = this.state

        try {
            this.setState({ loading: true })

            const req = new GetMessagesRequest()
            req.setChannel(currentChannel.name)

            const chatClient = ChatClient(dispatch)
            const res = await chatClient.getMessages(req, {})
            const messages = res.getMessagesList().map(message => {
                return {
                    avatar: message.getAvatar(),
                    channel: message.getChannel(),
                    id: message.getId(),
                    memo: message.getMemo(),
                    timestamp: message.getTimestamp().toDate(),
                    username: message.getUser(),
                }
            }).reverse()

            if (messages.length > 0) {
                this.setState({
                    clientMin: messages[0].id,
                    hasMore: messages[0].id > res.getMinId(),
                    loading: false,
                    serverMin: res.getMinId(),
                })

                dispatch({ type: 'set-messages', payload: messages })
                // scroll to bottom of messages
                this.messagesEndRef.current.scrollIntoView({ alignToTop: false })
            } else {
                this.setState({ loading: false })
            }
        } catch (err) {
            console.error('error loading messages:', err.message)
            // send to 404 page
        }
    }

    topMessageRef = node => {
        // only run if messages are scrollable
        const { dispatch } = this.context
        const { currentChannel } = this.state
        const { clientMin, hasMore, loading } = this.state
        const observer = this.observer

        if (loading)
            return

        if (observer.current)
            observer.current.disconnect()

        observer.current = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting && hasMore) {
                try {
                    this.setState({ loading: true })

                    const req = new GetFilteredMessagesRequest()
                    req.setChannel(currentChannel.name)
                    req.setMinId(clientMin)

                    const chatClient = ChatClient(dispatch)
                    const res = await chatClient.getFilteredMessages(req, {})
                    const messages = res.getMessagesList().map(message => {
                        return {
                            avatar: message.getAvatar(),
                            channel: message.getChannel(),
                            id: message.getId(),
                            memo: message.getMemo(),
                            timestamp: message.getTimestamp().toDate(),
                            username: message.getUser(),
                        }
                    }).reverse()

                    if (messages.length > 0) {
                        this.setState({
                            clientMin: messages[0].id,
                            hasMore: messages[0].id > res.getMinId(),
                            loading: false,
                            serverMin: res.getMinId()
                        })
                        dispatch({ type: 'add-old-messages', payload: messages })
                    }
                } catch (err) {
                    console.error('error loading messages:', err.message)
                    // send to 404 page
                }
            }
        }, { threshold: 1 })

        if (node) {
            observer.current.observe(node)
        }
    }

    render() {
        const { loading, messages } = this.state

        let spinner = null
        if (loading)
            spinner = <Spinner />

        let messagesJSX = null
        if (messages.length > 0) {
            messagesJSX = messages.map((message, index) => {
                if (index > 0) {
                    const prevMessage = messages[index - 1]
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
                            scrollRef={null}
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
                    scrollRef={index === 0 ? this.topMessageRef : null}
                />
            })
        }

        return (
            <div className={classes.Messages} ref={this.messagesRef}>
                {spinner}
                {messagesJSX}
                <div ref={this.messagesEndRef} style={{ marginBottom: '1rem' }}></div>
            </div>
        )
    }
}

export default Messages;