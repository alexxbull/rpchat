import React from 'react';

import Channels from '../../components/Channels/Channels.js';
import Messages from '../../components/Messages/Messages.js';
import Users from '../../components/Users/Users.js';

import classes from './Chat.module.css'

const Chat = props => {
    return (
        <div className={classes.Chat}>
            <Channels />
            <Messages />
            <Users />
        </div>
    )
}
export default Chat;
