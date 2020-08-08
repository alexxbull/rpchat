import React, { useContext, useState } from 'react'

import classes from './ReplyBox.module.css'

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { NewMessageRequest, EditMessageRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useCallback } from 'react'

const ReplyBox = props => {
    const { dispatch, state } = useContext(StoreContext)
    const [memo, setMemo] = useState('')
    const [error, setError] = useState('')

    // if mobile user is editing message, set memo to the edited message's memo
    const messageRef = useRef()
    const mobileMessageEdit = state.mobileMessageEdit
    const isDesktop = props.isDesktop

    const endMobileMessageEdit = useCallback(() => {
        setMemo('')
        dispatch({ type: 'set-mobile-message-edit', payload: {} })
    }, [dispatch])

    useEffect(() => {
        if (isDesktop || state.currentChannel.name !== mobileMessageEdit.channel) {
            // undo mobile message editing if layout changes to desktop
            endMobileMessageEdit()
        }
        else if (mobileMessageEdit.memo) {
            setMemo(mobileMessageEdit.memo)
            if (messageRef.current)
                messageRef.current.focus()
        }
    }, [dispatch, endMobileMessageEdit, isDesktop, mobileMessageEdit.channel, mobileMessageEdit.memo, state.currentChannel.name,])

    const inputChangeHandler = event => {
        setMemo(event.target.value)
        if (error)
            setError('')
    }

    const handleReply = async (event) => {
        event.preventDefault()

        if (mobileMessageEdit.memo) {
            if (mobileMessageEdit.memo !== memo) {
                try {
                    const req = new EditMessageRequest()
                    req.setId(mobileMessageEdit.id)
                    req.setMemo(memo)
                    req.setUser(state.username)

                    const chatClient = ChatClient(dispatch)
                    await chatClient.editMessage(req, {})
                }
                catch (err) {
                    console.error('Edit message erorr:', err);
                }
            }
            endMobileMessageEdit()
        }
        else {
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
    }

    let errorJSX = null
    if (error) {
        errorJSX =
            <div className={classes.Error}>
                <p>Unable to send message: {error}</p>
            </div>
    }

    // highlight on touch/longpress
    const [cancelBtnClasses, setCancelBtnClasses] = useState([classes.CancelBtn])
    const touchCancelBtnHighlight = {
        onTouchStart: () => setCancelBtnClasses([classes.CancelBtn, classes.CancelBtnHighlight]),
        onTouchEnd: () => setCancelBtnClasses([classes.CancelBtn]),
    }

    let editingMobileMessage = null
    if (mobileMessageEdit.memo) {
        editingMobileMessage =
            <div className={classes.EditingMobileMessage}>
                <div>Editing Message</div>
                <button
                    className={cancelBtnClasses.join(' ')}
                    onClick={endMobileMessageEdit}
                    {...touchCancelBtnHighlight}
                    type={'button'}
                >
                    Cancel
                </button>
            </div>
    }

    // highlight on touch/longpress
    const [replyBtnClasses, setReplyBtnClasses] = useState([classes.ReplyBtn])
    const touchReplyBtnHighlight = {
        onTouchStart: () => setReplyBtnClasses([classes.ReplyBtn, classes.Highlight]),
        onTouchEnd: () => setReplyBtnClasses([classes.ReplyBtn]),
    }

    return (
        <div className={classes.ReplyBox}>
            {errorJSX}
            {editingMobileMessage}
            <form className={classes.ReplyContainer} onSubmit={handleReply} >
                <input
                    type="text"
                    className={classes.Reply}
                    onChange={inputChangeHandler}
                    name={"memo"}
                    ref={messageRef}
                    value={memo}
                />
                <input
                    type="submit"
                    className={replyBtnClasses.join(' ')}
                    value={""}
                    {...touchReplyBtnHighlight}
                />
            </form>
        </div>
    )
}

export default ReplyBox