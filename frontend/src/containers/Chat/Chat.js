import React from 'react';

import Channels from '../../components/Channels/Channels';
import Messages from '../../components/Messages/Messages';

import classes from './Chat.module.css'

const Chat = props => {
    return (
        <div className={classes.Chat}>
            <Channels />
            <Messages />
            <div>Users Component</div>
        </div>
    )
}
export default Chat;
