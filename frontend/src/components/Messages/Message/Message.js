import React, { useContext, useEffect, useRef, useState } from 'react';

// css 
import classes from '../Messages.module.css';

// grpc
import { ChatClient } from '../../../client/grpc_clients.js';
import { EditMessageRequest } from '../../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../../context/Store.js';

const Message = props => {
    const { avatar, edited, grouped, id, isDesktop, memo, scrollRef, timestamp, user, username } = props
    const { state, dispatch } = useContext(StoreContext)

    const initialMessageOptions = {
        messageBtnClasses: [classes.MessageBtns],
        deleteBtnClasses: [classes.DeleteBtn, classes.MessageBtn],
        deletedClasses: [classes.Deleted],
        editBtnClasses: [classes.EditBtn, classes.MessageBtn],
        editedClasses: [classes.Edited],
        messageText: memo,
        messageTextClasses: [classes.Message_text],
        readOnly: true,
        editable: false,
        rows: 1,
        startLongPress: false,
    }
    const [messageOptions, setMessageOptions] = useState(initialMessageOptions)


    // close editable textarea when user clicks outside of textarea
    const messageTextRef = useRef()
    useEffect(() => {
        const handleClickOutside = event => {
            setMessageOptions(state => {
                if (state.messageBtnClasses[0] === classes.Hide && messageTextRef.current && !messageTextRef.current.contains(event.target))
                    return initialMessageOptions
                return state
            })
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [initialMessageOptions, messageTextRef]);

    // update message with edit changes
    useEffect(() => {
        setMessageOptions(state => {
            return {
                ...state,
                edited: edited,
                messageText: memo,
            }
        })
    }, [memo, edited])

    // reformat message to fit in textarea during edit
    useEffect(() => {
        if (messageOptions.editable) {
            let currentRows = null
            if (messageTextRef.current) {
                const lineHeight = 14.4;
                messageTextRef.current.rows = 1 // reset rows
                currentRows = Math.floor((messageTextRef.current.scrollHeight / lineHeight))
                messageTextRef.current.rows = currentRows
                messageTextRef.current.scrollIntoView({ alignToTop: false }) // scroll so the bottom of the message is visible
                messageTextRef.current.focus()
            }
        }
    }, [messageOptions.editable, messageOptions.messageText])

    // // undo message editing when switching from desktop to mobile
    useEffect(() => {
        if (!isDesktop && messageOptions.editable)
            setMessageOptions(initialMessageOptions)
    }, [messageOptions.editable, initialMessageOptions, isDesktop])

    // show edit button when user hovers over message
    const handleMouseEnter = () => {
        setMessageOptions(state => {
            if (state.messageBtnClasses[0] !== classes.Hide)
                return {
                    ...state,
                    messageBtnClasses: [classes.MessageBtns, classes.ShowBtns],
                }
            return state
        })
    }
    const handleMouseLeave = () => {
        setMessageOptions(state => {
            if (state.messageBtnClasses[0] !== classes.Hide)
                return {
                    ...state,
                    messageBtnClasses: [classes.MessageBtns],
                }
            return state
        })
    }

    // hide edit button and make message editable
    const handleEdit = () => {
        props.hideMessageOptions()

        setMessageOptions(state => {
            return {
                ...state,
                editable: true,
                messageBtnClasses: [classes.Hide],
                editedClasses: [classes.Hide],
                messageTextClasses: [classes.Message_text, classes.Message_text_editable],
                readOnly: false,
            }
        })
    }

    // handle user editing message
    const submitEdit = async (event) => {
        // submit edit changes if the user pressed only the Enter key
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            const newMessageText = messageOptions.messageText.trim()
            if (newMessageText !== memo) {
                try {
                    const req = new EditMessageRequest()
                    req.setId(id)
                    req.setMemo(newMessageText)
                    req.setUser(state.username)

                    const chatClient = ChatClient(dispatch)
                    await chatClient.editMessage(req, {})
                }
                catch (err) {
                    console.error('Edit message erorr:', err);
                }
            }
            setMessageOptions(initialMessageOptions)
        }
        // cancel edit changes if the user pressed the Escape key
        else if (event.key === 'Escape') {
            props.hideMessageOptions()
            setMessageOptions(initialMessageOptions)
        }
    }

    // handle text change when user edits message
    const handleEditChange = event => {
        const newMessageText = event.target.value
        setMessageOptions(({ ...messageOptions, messageText: newMessageText }))
    }

    // move caret to the end of the message when tries to edit message
    const moveCaretAtEnd = event => {
        const temp_value = event.target.value
        event.target.value = ''
        event.target.value = temp_value
    }

    const messageClasses = [classes.Message]
    let userIcon = classes.Invisible
    let metadata = null

    if (!grouped) {
        messageClasses.push(classes.TopMargin)
        userIcon = classes.Visible
        metadata =
            <span className={classes.User_name}>{username}
                <span className={classes.Message_timestamp}>{timestamp}</span>
            </span>
    }

    let editBtn = null
    if (username === state.username)
        editBtn = <button className={messageOptions.editBtnClasses.join(' ')} onClick={handleEdit}></button>

    let editedIndicator = null
    if (edited)
        editedIndicator = <div className={messageOptions.editedClasses.join(' ')}>(edited)</div>

    // handle long press
    const messageUser = username
    const showMessageOptions = props.showMessageOptions
    useEffect(() => {
        let timer

        if (messageOptions.startLongPress) {
            timer = setTimeout(() => {
                if (state.username === messageUser) {
                    showMessageOptions()
                    setMessageOptions(opts => ({ ...opts, showEdit: false, }))
                }
            }, 400)
        }
        else
            clearTimeout(timer)

        return () => clearTimeout(timer)
    }, [messageOptions.startLongPress, messageUser, showMessageOptions, state.username])

    const longPress = {
        onTouchStart: () => setMessageOptions({ ...messageOptions, startLongPress: true }),
        onTouchEnd: () => setMessageOptions({ ...messageOptions, startLongPress: false }),
    }

    let messageText = (
        <div
            className={messageOptions.messageTextClasses.join(' ')}
            {...longPress}
        >
            {memo}
        </div>
    )
    if (messageOptions.editable) {
        messageText =
            <textarea
                className={messageOptions.messageTextClasses.join(' ')}
                value={messageOptions.messageText}
                onKeyDown={submitEdit}
                onChange={handleEditChange}
                readOnly={messageOptions.readOnly}
                ref={messageTextRef}
                rows={messageOptions.rows}
                onFocus={moveCaretAtEnd}
            >
            </textarea>
    }

    let deleteBtn = null
    if (username === state.username)
        deleteBtn = <button className={messageOptions.deleteBtnClasses.join(' ')} onClick={props.showDeleteModal}></button>

    return (
        <>
            < div
                className={messageClasses.join(' ')}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={scrollRef ? scrollRef : null}
            >
                <div className={messageOptions.messageBtnClasses.join(' ')}>
                    {editBtn}
                    {deleteBtn}
                </div>
                <div className={userIcon}>
                    <img className={classes.User_icon} src={avatar} alt={`${user} avatar`} />
                </div>
                <div className={classes.Message_content} >
                    {metadata}
                    <div className={classes.Message_text_container}>
                        {messageText}
                        {editedIndicator}
                    </div>
                    <div className={classes.Message_time}>{timestamp}</div>
                </div>
            </div >
        </>
    )
}

export default Message;