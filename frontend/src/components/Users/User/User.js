import React from 'react';

const User = props =>
    <div className="User">
        <img src={props.avatar} alt={`${props.name} avatar`} />
        <div className="user-name">{props.name}</div>
    </div>

export default User;
