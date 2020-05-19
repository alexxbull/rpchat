import React from 'react';

import Message from './Message/Message';


const Messages = props => {
    const messagesData = [
        { memo: "Message1", id: 1, timestamp: "time1", user: "user1" },
        { memo: "Message2", id: 2, timestamp: "time2", user: "user2" },
        { memo: "Message3", id: 3, timestamp: "time3", user: "user3" },
    ]

    const messages = messagesData.map(message =>
        <Message
            key={message.id}
            memo={message.memo}
            timestamp={message.timestamp}
            user={message.user}
        />
    )

    return (
        <div className="messages">
            {messages}
        </div>
    )
}

export default Messages;
