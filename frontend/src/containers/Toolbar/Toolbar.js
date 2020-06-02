import React from 'react'

import classes from './Toolbar.module.css'

const Toolbar = props => {
    let toolbar = null

    if (props.show) {
        const channelsButton =
            <button
                className={classes.Channels_btn}
                onClick={props.showChannels}
            >
                <span className={classes.Channels_btn_bar}></span>
                <span className={classes.Channels_btn_bar}></span>
                <span className={classes.Channels_btn_bar}></span>
            </button>

        toolbar = <div className={classes.Toolbar}>
            {channelsButton}
            <h1 className={classes.Channel_name}>Current Channel</h1>
            <button className={classes.Users_btn} onClick={props.showUsers}></button>
        </div>
    }

    return toolbar

}

export default Toolbar