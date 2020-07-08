import React, { createContext, useReducer } from 'react'

const StoreContext = createContext({})

const initialState = {
    channels: [],
    currentChannel: {},
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'set-channels':
            return {
                ...state,
                channels: action.payload,
            }
        case 'set-current-channel':
            return {
                ...state,
                currentChannel: action.payload,
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