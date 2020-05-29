import React from 'react';

import Messages from '../../components/Messages/Messages.js';

import classes from './Chat.module.css'
import ReplyBox from '../../components/ReplyBox/ReplyBox.js';

const Chat = props => {
    return (
        <div className={classes.Chat}>
            <Messages />
            <ReplyBox />
        </div>
    )
}

export default Chat;