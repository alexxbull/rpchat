import React, { useContext } from 'react'

import classes from './Toolbar.module.css'

// context
import { StoreContext } from '../../context/Store'

const Toolbar = props => {
    const { state } = useContext(StoreContext)
    const currentChannel = state.currentChannel

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
            <h1 className={classes.Channel_name}>{currentChannel.name}</h1>
            <button className={classes.Users_btn} onClick={props.showUsers}></button>
        </div>
    }

    return toolbar

}

export default Toolbar