import React, { createContext, useReducer } from 'react'

const StoreContext = createContext({})

const initialState = {
    channels: [],
    currentChannel: {},
    listening: false,
    messages: [],
    mobileMessageEdit: {},
    userAvatar: '',
    username: '',
    users: [],
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'add-channel':
            return {
                ...state,
                channels: [...state.channels, action.payload]
            }
        case 'add-message':
            const message = action.payload

            // save new message if it's from the same channel the user is viewing
            if (state.currentChannel.name === message.channel)
                return {
                    ...state,
                    messages: [...state.messages, message],
                }
            else
                return state
        case 'add-old-messages':
            return {
                ...state,
                messages: [...action.payload, ...state.messages],
            }
        case 'add-user':
            return {
                ...state,
                users: [...state.users, action.payload]
            }
        case 'deleted-channel':
            const deletedChannel = action.payload
            const remainingChannels = state.channels.filter(channel => channel.id !== deletedChannel.id)
            return {
                ...state,
                channels: remainingChannels,
                currentChannel: deletedChannel.name === state.currentChannel.name ? remainingChannels[0] : state.currentChannel
            }
        case 'deleted-message':
            const deletedMessage = action.payload
            const remainingMessages = state.messages.filter(message => message.id !== deletedMessage.id)
            return {
                ...state,
                messages: remainingMessages,
            }
        case 'edit-channel':
            let editedChannel = action.payload
            const updatedChannels = state.channels.map(channel => {
                const newChannel = { ...channel }
                if (newChannel.id === editedChannel.id) {
                    newChannel.name = editedChannel.name
                    newChannel.desc = editedChannel.desc
                    editedChannel = newChannel
                }
                return newChannel
            })

            return {
                ...state,
                channels: updatedChannels,
                currentChannel: state.currentChannel.id === editedChannel.id ? { ...editedChannel } : state.currentChannel,
            }
        case 'edit-message':
            const editedMessage = action.payload
            const updatedMessages = state.messages.map(message => {
                const newMessage = { ...message }
                if (newMessage.id === editedMessage.id) {
                    newMessage.memo = editedMessage.memo
                    newMessage.edited = editedMessage.edited
                }
                return newMessage
            })

            return {
                ...state,
                messages: updatedMessages,
            }
        case 'logged-in':
            const user = action.payload
            return {
                ...state,
                userAvatar: user.avatar,
                username: user.username,
            }
        case 'logout':
            window.accessToken = null
            return initialState
        case 'set-channels':
            return {
                ...state,
                channels: action.payload.channels,
                currentChannel: action.payload.currentChannel
            }
        case 'set-current-channel':
            if (state.currentChannel)
                state.currentChannel.active = false

            return {
                ...state,
                currentChannel: action.payload,
            }
        case 'set-listening':
            return {
                ...state,
                listening: action.payload,
            }
        case 'set-messages':
            return {
                ...state,
                messages: action.payload,
            }
        case 'set-mobile-message-edit':
            return {
                ...state,
                mobileMessageEdit: { ...action.payload }
            }
        case 'set-user-avatar':
            return {
                ...state,
                userAvatar: action.payload,
            }
        case 'set-users':
            return {
                ...state,
                users: action.payload,
            }
        default:
            return state
    }
}

const StoreProvider = props => {
    const [state, dispatch] = useReducer(reducer, initialState)

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    )
}

export { StoreContext, StoreProvider }