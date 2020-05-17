import React from 'react';

const channel = props =>
    <div className="channel">
        <div className="channel-icon">#</div>
        <h1 className="channel-name">{props.name}</h1>
    </div>

export default channel;
