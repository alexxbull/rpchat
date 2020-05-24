import React from 'react';

import classes from './Messages.module.css';

import UserIcon from '../../assets/user-icon.svg'

import Message from './Message/Message';


const Messages = props => {
    const messagesData = [
        {
            memo: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde nemo sequi corporis in inventore sunt totam quaerat! Fugiat ipsam magnam placeat voluptatem quam! Mollitia voluptatibus eius deleniti vero libero sint!',
            id: 1,
            timestamp: 'time1',
            username: 'user1',
            avatar: UserIcon
        },
        {
            memo: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde nemo sequi corporis in inventore sunt totam quaerat! Fugiat ipsam magnam placeat voluptatem quam! Mollitia voluptatibus eius deleniti vero libero sint!',
            id: 2,
            timestamp: 'time2',
            username: 'user2',
            avatar: UserIcon
        },
        {
            memo: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde nemo sequi corporis in inventore sunt totam quaerat! Fugiat ipsam magnam placeat voluptatem quam! Mollitia voluptatibus eius deleniti vero libero sint!',
            id: 3,
            timestamp: 'time3',
            username: 'user3',
            avatar: UserIcon
        },
    ]

    const messages = messagesData.map(message =>
        <Message
            key={message.id}
            memo={message.memo}
            timestamp={message.timestamp}
            username={message.username}
            avatar={message.avatar}
        />
    )

    return (
        <div className={classes.Messages}>
            {messages}
        </div>
    )
}

export default Messages;
