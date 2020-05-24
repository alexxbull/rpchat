import React from 'react';

import classes from '../Messages.module.css';

const Message = props =>
    < div className={classes.Message} >
        <img className={classes.User_icon} src={props.avatar} alt={`${props.user} avatar`} />
        <div className={classes.Message_content}>
            <span className={classes.User_name}>{props.username}
                <span className={classes.Message_date}>{'date ' + props.timestamp}</span>
                <span className={classes.Message_date}>{'time ' + props.timestamp}</span>
            </span>
            <ol className={classes.Message_text_list}>
                <li className={classes.Message_text_item}>
                    <p className={classes.Message_text}>{props.memo}</p>
                    <div className={classes.Message_time}>{props.timestamp}</div>
                </li>
            </ol>
        </div>
    </div >

export default Message;