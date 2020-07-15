import React, { useContext, useState } from 'react'

import classes from './ReplyBox.module.css'

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { NewMessageRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store'

const ReplyBox = props => {
    const { dispatch, state } = useContext(StoreContext)
    const [memo, setMemo] = useState('')
    const [error, setError] = useState('')

    const inputChangeHandler = event => {
        setMemo(event.target.value)
        if (error)
            setError('')
    }

    const handleReply = async (event) => {
        event.preventDefault()

        const req = new NewMessageRequest()
        req.setMemo(memo)
        req.setUser(state.username)
        req.setChannel(state.currentChannel.name)

        try {
            const chatClient = ChatClient(dispatch)
            await chatClient.addMessage(req, {})
            setMemo('')
        }
        catch (err) {
            setError(err.message)
        }
    }

    let errorJSX = null
    if (error) {
        errorJSX =
            <div className={classes.Error}>
                <p>Unable to send message: {error}</p>
            </div>
    }

    return (
        <div className={classes.ReplyBox}>
            {errorJSX}
            <form className={classes.ReplyContainer} onSubmit={handleReply}>
                <input type="text" className={classes.Reply} onChange={inputChangeHandler} name={"memo"} value={memo} />
                <input type="submit" className={classes.ReplyBtn} value={""} />
            </form>
        </div>
    )
}

export default ReplyBox