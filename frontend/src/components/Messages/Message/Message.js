import React from 'react';

const Message = props =>
    <div className="message">
        <div className="message-user">{props.user}</div>
        <p>{props.memo}</p>
        <div className="message-time">{props.timestamp}</div>
    </div>

export default Message;
