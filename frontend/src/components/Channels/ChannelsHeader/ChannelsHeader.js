import React from 'react'

import classes from './ChannelsHeader.module.css'

const ChannelsHeader = props => {
    return (
        <header className={classes.ChannelsHeader}>
            <div className={classes.Channels_icon}></div>
            <h1 className={classes.ChannelsHeader_title}>Channels</h1>
            <button className={classes.Add_btn}>+</button>
        </header>
    )
}

export default ChannelsHeader