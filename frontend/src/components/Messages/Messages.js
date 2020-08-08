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
import Backdrop from '../Backdrop/Backdrop';


const initialMessageOptions = {
    messageEditing: null,
    messageOptionClasses: [classes.MessageOption],
    messageOptionsClasses: [classes.MessageOptions],
}

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
        ...initialMessageOptions,
    }

    // load messages after initial render
    componentDidMount() {
        this.loadMessages()
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        // capture the scroll position so we can adjust scroll later if new messages were added.
        if (this.state.messages.length > prevState.messages.length && this.messagesRef) {
            const messagesJSX = this.messagesRef.current;
            return { scrollHeight: messagesJSX.scrollHeight, scrollTop: messagesJSX.scrollTop }
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
        const stateMessages = this.state.messages
        const messagesDiff = () => stateMessages.some((message, index) => message.memo !== storeMessages[index].memo)

        if (stateMessages.length !== storeMessages.length) {
            this.setState({ messages: [...storeMessages] })
        }
        else if (messagesDiff()) {
            this.setState({ messages: [...storeMessages] })
        }

        // adjust scroll so the new messages don't push the old ones out of view.
        if (snapshot !== null) {
            const messagesJSX = this.messagesRef.current;
            messagesJSX.scrollTop = messagesJSX.scrollHeight - snapshot.scrollHeight + snapshot.scrollTop
        }

        // hide message options menu on desktop
        if (this.props.isDesktop && !prevProps.isDesktop)
            this.setState({ ...initialMessageOptions })
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
                    edited: message.getEdited(),
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
                // scroll to bottom of messages after delay to allow each message to format correctly
                const scrollToBottom = () => this.messagesEndRef.current.scrollIntoView({ alignToTop: false })
                setTimeout(() => scrollToBottom(), 500)
            } else {
                dispatch({ type: 'set-messages', payload: [] })
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
        const observer = this.observer

        if (this.state.loading)
            return

        if (observer.current)
            observer.current.disconnect()

        observer.current = new IntersectionObserver(async (entries) => {
            const { currentChannel, clientMin, hasMore } = this.state
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
                            edited: message.getEdited(),
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

    handleMobileMessageEdit = () => {
        this.context.dispatch({ type: 'set-mobile-message-edit', payload: this.state.messageEditing })
        this.setState({ ...initialMessageOptions })
    }

    render() {

        // highlight on touch/longpress
        const touchHighlight = {
            onTouchStart: () => this.setState({ messageOptionClasses: [classes.MessageOption, classes.Highlight] }),
            onTouchEnd: () => this.setState({ messageOptionClasses: [classes.MessageOption] }),
        }

        const { loading, messages, messageOptionClasses, messageOptionsClasses } = this.state

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
                            id={message.id}
                            channel={message.channel}
                            edited={message.edited}
                            memo={message.memo}
                            timestamp={moment(message.timestamp).format('L').toString()}
                            username={message.username}
                            avatar={message.avatar}
                            scrollRef={null}
                            hideMessageOptions={() => this.setState({ ...initialMessageOptions })}
                            showMessageOptions={() => this.setState({ messageEditing: message, messageOptionsClasses: [classes.MessageOptions, classes.ShowOptions] })}
                        />
                    }
                }

                // do not group this message
                return <Message
                    group={false}
                    key={message.id}
                    id={message.id}
                    channel={message.channel}
                    edited={message.edited}
                    memo={message.memo}
                    timestamp={moment(message.timestamp).format('L').toString()}
                    username={message.username}
                    avatar={message.avatar}
                    scrollRef={index === 0 ? this.topMessageRef : null}
                    hideMessageOptions={() => this.setState({ ...initialMessageOptions })}
                    showMessageOptions={() => this.setState({ messageEditing: message, messageOptionsClasses: [classes.MessageOptions, classes.ShowOptions] })}
                />
            })
        }

        return (
            <>
                <div className={classes.Messages} ref={this.messagesRef}>
                    {spinner}
                    {messagesJSX}
                    <div ref={this.messagesEndRef} style={{ marginBottom: '1rem' }}></div>
                </div>

                <ul className={messageOptionsClasses.join(' ')}>
                    <button
                        className={messageOptionClasses.join(' ')}
                        onClick={this.handleMobileMessageEdit}
                        {...touchHighlight}
                    >Edit Message
                </button>
                </ul>

                <Backdrop
                    show={messageOptionsClasses.includes(classes.ShowOptions)}
                    click={() => this.setState({ ...initialMessageOptions })}
                />
            </>
        )
    }
}

export default Messages;