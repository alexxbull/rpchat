import React from 'react';

import classes from './Chat.module.css'

// components
import Messages from '../../components/Messages/Messages.js';
import ReplyBox from '../../components/ReplyBox/ReplyBox.js';
import Toolbar from '../Toolbar/Toolbar.js';

const Chat = props => {
    return (
        <div className={classes.Chat}>
            <Toolbar
                isDesktop={props.isDesktop}
                showChannels={props.showChannels}
                showUsers={props.showUsers}
            />
            <Messages isDesktop={props.isDesktop} />
            <ReplyBox isDesktop={props.isDesktop} />
        </div>
    )
}

export default Chat;