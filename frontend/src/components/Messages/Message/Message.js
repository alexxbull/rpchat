import React from 'react';

import classes from '../Messages.module.css';

const Message = props => {
    const attachedClasses = [classes.Message]
    let userIcon = classes.Invisible
    let metadata = null

    if (!props.group) {
        attachedClasses.push(classes.TopMargin)
        userIcon = classes.Visible
        metadata =
            <span className={classes.User_name}>{props.username}
                <span className={classes.Message_timestamp}>{props.timestamp}</span>
            </span>
    }

    return < div className={attachedClasses.join(' ')} >
        <div className={userIcon}>
            <img className={classes.User_icon} src={props.avatar} alt={`${props.user} avatar`} />
        </div>
        <div className={classes.Message_content}>
            {metadata}
            <p className={classes.Message_text}>{props.memo}</p>
            <div className={classes.Message_time}>{props.timestamp}</div>
        </div>
    </div >
}

export default Message;