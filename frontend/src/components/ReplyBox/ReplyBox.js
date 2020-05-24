import React from 'react'

import classes from './ReplyBox.module.css'

const ReplyBox = props => {
    return (
        <div className={classes.ReplyBox}>
            <input type="text" className={classes.Reply} />
            <button className={classes.ReplyBtn}></button>
        </div>
    )
}

export default ReplyBox