import React, { createContext, useReducer } from 'react'

const StoreContext = createContext({})

const initialState = {
    channels: [],
    currentChannel: {},
    listening: false,
    messages: [],
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
                    messages: [...state.messages, message]
                }
            else
                return state
        case 'add-user':
            return {
                ...state,
                users: [...state.users, action.payload]
            }
        case 'logged-in':
            return {
                ...state,
                username: action.payload,
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