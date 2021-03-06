import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment'

// css
import classes from './Messages.module.css';

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { DeleteMessageRequest, GetFilteredMessagesRequest, GetMessagesRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store';

// components
import Message from './Message/Message';
import Spinner from '../Spinner/Spinner';
import Backdrop from '../Backdrop/Backdrop';
import DeleteModal from '../DeleteModal/DeleteModal';


const initialMessageOptions = {
    deleteMessage: false,
    deleteMessageError: '',
    targetMessage: null,
    messageOptionClasses: [classes.MessageOption],
    messageOptionsClasses: [classes.MessageOptions],
}

class Messages extends Component {
    static contextType = StoreContext

    messagesEndRef = React.createRef()
    messagesRef = React.createRef()
    observer = React.createRef()

    initialState = {
        broadcastListening: this.context.state.listening,
        clientMin: 0,
        currentChannel: this.context.state.currentChannel,
        hasMore: false,
        loading: false,
        messages: this.context.state.messages,
        serverMin: 0,
        ...initialMessageOptions,
    }

    state = { ...this.initialState }

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
        // update when global store's listening is updated
        const listening = this.context.state.listening
        const { broadcastListening } = this.state
        if (listening !== broadcastListening)
            this.setState({ broadcastListening: listening })

        // reset to initial state and update currentChannel when global store's currentChannel is updated
        const storeCurrentChannel = this.context.state.currentChannel
        if (this.state.currentChannel.name !== storeCurrentChannel.name) {
            this.setState({ ...this.initialState, currentChannel: storeCurrentChannel })
        }

        // load messages when any are true: 
        // - currentChannel is updated
        // - if user is connected to broadcast stream
        if (this.state.currentChannel.name !== prevState.currentChannel.name
            || (broadcastListening && !prevState.broadcastListening)
        ) {
            this.loadMessages()
        }

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

        // hide message options menu whening changing between mobile and desktop
        if ((this.props.isDesktop && !prevProps.isDesktop) || (!this.props.isDesktop && prevProps.isDesktop))
            this.setState({ ...initialMessageOptions })
    }

    loadMessages = async () => {
        const { dispatch } = this.context
        const { broadcastListening, currentChannel } = this.state

        // only load messages if user is connected to broadcast stream
        if (broadcastListening) {
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
                this.props.history.push('/error')
            }
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
                    this.props.history.push('/error')
                }
            }
        }, { threshold: 1 })

        if (node) {
            observer.current.observe(node)
        }
    }

    handleMobileMessageEdit = () => {
        this.context.dispatch({ type: 'set-mobile-message-edit', payload: this.state.targetMessage })
        this.setState({ ...initialMessageOptions })
    }

    handleDeleteMessage = async () => {
        const { dispatch, state } = this.context

        try {
            const req = new DeleteMessageRequest()
            req.setId(this.state.targetMessage.id)
            req.setUsername(state.username)

            const chatClient = ChatClient(dispatch)
            await chatClient.deleteMessage(req, {})
            this.setState({ ...initialMessageOptions })
        }
        catch (err) {
            console.error('Edit message erorr:', err.message)
            this.setState({ deleteMessageError: err.message })
        }
    }

    render() {
        // highlight on touch/longpress
        const touchHighlight = {
            onTouchStart: event => event.target.classList.add(classes.Highlight),
            onTouchEnd: event => event.target.classList.remove(classes.Highlight),
        }

        const { broadcastListening, deleteMessage, deleteMessageError, loading, messages, messageOptionClasses, messageOptionsClasses, targetMessage } = this.state

        let spinner = null
        if (loading || !broadcastListening)
            spinner = <Spinner />

        let messagesJSX = null
        if (messages.length > 0) {
            messagesJSX = messages.map((message, index) => {
                let newDateSeperator = null

                if (index > 0) {
                    const prevMessage = messages[index - 1]
                    const messageDate = moment(message.timestamp).format('ll').toString()
                    const prevMessageDate = moment(prevMessage.timestamp).format('ll').toString()

                    if (prevMessageDate !== messageDate) {
                        // Date format: Month name Day, YYYY
                        newDateSeperator = <div className={classes.NewDateSeperator}><div>{messageDate}</div></div>
                    }

                    // group consecutive messages from the same user on the same day
                    if (message.username === prevMessage.username && messageDate === prevMessageDate) {
                        return (
                            <Message
                                grouped={true}
                                key={message.id}
                                id={message.id}
                                channel={message.channel}
                                edited={message.edited}
                                memo={message.memo}
                                timestamp={moment(message.timestamp).format('L').toString()}
                                time={moment(message.timestamp).format('LT').toString()}
                                username={message.username}
                                avatar={message.avatar}
                                scrollRef={null}
                                hideMessageOptions={() => this.setState({ ...initialMessageOptions })}
                                showMessageOptions={() => this.setState({ targetMessage: message, messageOptionsClasses: [classes.MessageOptions, classes.ShowOptions] })}
                                isDesktop={this.props.isDesktop}
                                showDeleteModal={() => this.setState({ deleteMessage: true, targetMessage: message })}
                            />
                        )
                    }
                }

                // do not group this message
                return (
                    <div key={message.id}>
                        {newDateSeperator}
                        <Message
                            grouped={false}
                            id={message.id}
                            channel={message.channel}
                            edited={message.edited}
                            memo={message.memo}
                            timestamp={moment(message.timestamp).format('lll').toString()}
                            username={message.username}
                            avatar={message.avatar}
                            scrollRef={index === 0 ? this.topMessageRef : null}
                            hideMessageOptions={() => this.setState({ ...initialMessageOptions })}
                            showMessageOptions={() => this.setState({ targetMessage: message, messageOptionsClasses: [classes.MessageOptions, classes.ShowOptions] })}
                            isDesktop={this.props.isDesktop}
                            showDeleteModal={() => this.setState({ deleteMessage: true, targetMessage: message })}
                        />
                    </div>
                )
            })
        }

        let deleteMessageModal = null
        if (deleteMessage)
            deleteMessageModal = (
                <DeleteModal
                    autoHeight={this.props.isDesktop ? true : false}
                    error={deleteMessageError}
                    show={true}
                    close={() => this.setState({ ...initialMessageOptions })}
                    content={targetMessage.memo}
                    isDesktop={this.props.isDesktop}
                    submit={this.handleDeleteMessage}
                    title={'Delete Message'}
                />
            )

        return (
            <>
                <div className={classes.Messages} ref={this.messagesRef}>
                    {spinner}
                    {messagesJSX}
                    <div ref={this.messagesEndRef} style={{ marginBottom: '1rem' }}></div>
                </div>

                <ul className={messageOptionsClasses.join(' ')}>
                    <li
                        className={messageOptionClasses.join(' ')}
                        onClick={this.handleMobileMessageEdit}
                        {...touchHighlight}
                    >Edit Message
                </li>
                    <li
                        className={messageOptionClasses.join(' ')}
                        onClick={() => this.setState({ deleteMessage: true })}
                        {...touchHighlight}
                    >Delete Message
                </li>
                </ul>
                {deleteMessageModal}

                <Backdrop
                    show={messageOptionsClasses.includes(classes.ShowOptions)}
                    click={() => this.setState({ ...initialMessageOptions })}
                />
            </>
        )
    }
}

export default withRouter(Messages)