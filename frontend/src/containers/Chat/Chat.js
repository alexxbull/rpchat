import React from 'react';

import Channels from '../../components/Channels/Channels';

import classes from './Chat.module.css'

const Chat = props => {
    return (
        <div className={classes.Chat}>
            <Channels />
            <div>Messages components</div>
            <div>Users Component</div>
        </div>
    )
}
export default Chat;
