import React, { useContext } from 'react';

import classes from './Chat.module.css'

// context
import { StoreContext } from '../../context/Store.js';

// components
import Messages from '../../components/Messages/Messages.js';
import ReplyBox from '../../components/ReplyBox/ReplyBox.js';

const Chat = props => {
    const { state } = useContext(StoreContext)
    const currentChannel = state.currentChannel

    return (
        <div className={classes.Chat}>
            <div className={classes.ChannelHeader}>
                <div className={classes.Hashtag}>#</div>
                <h1 className={classes.ChannelName}>{currentChannel.name}</h1>
                <div className={classes.Divider}>|</div>
                <p className={classes.ChannelDesc}>{currentChannel.desc}</p>
            </div>
            <Messages />
            <ReplyBox />
        </div>
    )
}

export default Chat;