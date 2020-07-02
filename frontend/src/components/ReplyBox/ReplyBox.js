import React, { useState } from 'react'

import classes from './ReplyBox.module.css'

import { ChatClient } from '../../client/grpc_clients.js'
import { NewMessageRequest } from '../../proto/chat/chat_pb.js'

const ReplyBox = props => {
    const [memo, setMemo] = useState('')
    const [error, setError] = useState('')

    const inputChangeHandler = event => {
        setMemo(event.target.value)
        if (error)
            setError('')
    }

    const handleReply = async (event) => {
        const req = new NewMessageRequest()
        req.setMemo(memo)
        req.setUser(window.username)
        req.setChannel(window.currentChannel)

        try {
            const res = await ChatClient.addMessage(req, {})
            console.log('msg add res', res)
            console.log('msg id', res.getId())
            console.log('msg date', res.getPostDate().toDate())
            console.log('form submitted')
        }
        catch (err) {
            console.log('send message error', err)
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
            <div className={classes.ReplyContainer}>
                <input type="text" className={classes.Reply} onChange={inputChangeHandler} name={"memo"} value={memo} />
                <button className={classes.ReplyBtn} onClick={handleReply}></button>
            </div>
        </div>
    )
}

export default ReplyBox