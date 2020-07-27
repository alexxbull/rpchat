import React, { useContext, useEffect, useRef, useState } from 'react';

// css 
import classes from '../Messages.module.css';

// grpc
import { ChatClient } from '../../../client/grpc_clients.js';
import { EditMessageRequest } from '../../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../../context/Store.js';

const Message = props => {
    const { state, dispatch } = useContext(StoreContext)

    const initialMessageEdit = {
        editBtnClasses: [classes.EditBtn],
        editedClasses: [classes.Edited],
        messageText: props.memo,
        messageTextClasses: [classes.Message_text],
        readOnly: true,
        editable: false,
        rows: 1,
    }
    const [messageEdit, setMessageEdit] = useState(initialMessageEdit)

    // show edit button when user hovers over message
    const handleMouseEnter = () => setMessageEdit(state => {
        if (state.editBtnClasses[0] !== classes.Hide)
            return {
                ...state,
                editBtnClasses: [classes.EditBtn, classes.Show],
            }
        return state
    })
    const handleMouseLeave = () => setMessageEdit(state => {
        if (state.editBtnClasses[0] !== classes.Hide)
            return {
                ...state,
                editBtnClasses: [classes.EditBtn],
            }
        return state
    })

    // hide edit button and make message editable
    const handleEdit = () => {
        setMessageEdit(state => {
            return {
                ...state,
                editBtnClasses: [classes.Hide],
                editedClasses: [classes.Hide],
                messageTextClasses: [classes.Message_text, classes.Message_text_editable],
                readOnly: false,
                editable: true,
            }
        })
        if (messageTextRef.current)
            messageTextRef.current.focus()
    }

    // handle user editing message
    const submitEdit = async (event) => {
        // submit edit changes if the user pressed only the Enter key
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            const newMessageText = messageEdit.messageText.trim()
            if (newMessageText !== props.memo) {
                try {
                    const req = new EditMessageRequest()
                    req.setId(props.id)
                    req.setMemo(newMessageText)

                    const chatClient = ChatClient(dispatch)
                    await chatClient.editMessage(req, {})
                }
                catch (err) {
                    console.error('Edit message erorr:', err);
                }
            }
            setMessageEdit(initialMessageEdit)
        }
        // cancel edit changes if the user pressed the Escape key
        else if (event.key === 'Escape')
            setMessageEdit(initialMessageEdit)
    }

    // handle text change when user edits message
    const handleEditChange = event => {
        const newMessageText = event.target.value
        setMessageEdit(state => {
            return {
                ...state,
                messageText: newMessageText,
            }
        })
    }

    // close editable textarea when user clicks outside of textarea
    const messageTextRef = useRef()
    useEffect(() => {
        const handleClickOutside = event => {
            setMessageEdit(state => {
                if (state.editBtnClasses[0] === classes.Hide && messageTextRef.current && !messageTextRef.current.contains(event.target))
                    return initialMessageEdit
                return state
            })
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [initialMessageEdit, messageTextRef]);

    // update message with edit changes
    useEffect(() => {
        setMessageEdit(state => {
            return {
                ...state,
                edited: props.edited,
                messageText: props.memo,
            }
        })
    }, [props.memo, props.edited])

    // reformat message to fit in textarea after edit
    useEffect(() => {
        let currentRows = null
        if (messageTextRef.current) {
            const lineHeight = 14.4;
            messageTextRef.current.rows = 1 // reset rows
            currentRows = Math.floor((messageTextRef.current.scrollHeight / lineHeight))
            messageTextRef.current.rows = currentRows
            messageTextRef.current.scrollIntoView({ alignToTop: false }) // scroll so the bottom of the message is visible
        }
    }, [messageEdit.messageText])

    // move caret to the end of the message when tries to edit message
    const moveCaretAtEnd = event => {
        const temp_value = event.target.value
        event.target.value = ''
        event.target.value = temp_value
    }

    const messageClasses = [classes.Message]
    let userIcon = classes.Invisible
    let metadata = null

    if (!props.group) {
        messageClasses.push(classes.TopMargin)
        userIcon = classes.Visible
        metadata =
            <span className={classes.User_name}>{props.username}
                <span className={classes.Message_timestamp}>{props.timestamp}</span>
            </span>
    }

    let editBtn = null
    if (props.username === state.username)
        editBtn = <button className={messageEdit.editBtnClasses.join(' ')} onClick={handleEdit}></button>

    let edited = null
    if (props.edited)
        edited = <div className={messageEdit.editedClasses.join(' ')}>(edited)</div>

    return (
        < div
            className={messageClasses.join(' ')}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={props.scrollRef ? props.scrollRef : null}
        >
            {editBtn}
            <div className={userIcon}>
                <img className={classes.User_icon} src={props.avatar} alt={`${props.user} avatar`} />
            </div>
            <div className={classes.Message_content} >
                {metadata}
                <div className={classes.Message_text_container}>
                    <textarea
                        className={messageEdit.messageTextClasses.join(' ')}
                        value={messageEdit.messageText}
                        onKeyDown={submitEdit}
                        onChange={handleEditChange}
                        readOnly={messageEdit.readOnly}
                        ref={messageTextRef}
                        rows={messageEdit.rows}
                        onFocus={moveCaretAtEnd}
                    >
                    </textarea>
                    {edited}
                </div>
                <div className={classes.Message_time}>{props.timestamp}</div>
            </div>
        </div >
    )
}

export default Message;