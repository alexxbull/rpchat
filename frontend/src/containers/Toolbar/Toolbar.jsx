import React, { useContext } from 'react'

// css
import classes from './Toolbar.module.css'

// context
import { StoreContext } from '../../context/Store'

const Toolbar = props => {
    const { state } = useContext(StoreContext)
    const currentChannel = state.currentChannel

    const mobileToolbar = (
        <div className={classes.Toolbar}>
            <button
                className={classes.ChannelsBtn}
                onClick={props.showChannels}
            >
                <span className={classes.ChannelsBtn_bar}></span>
                <span className={classes.ChannelsBtn_bar}></span>
                <span className={classes.ChannelsBtn_bar}></span>
            </button>
            <h1 className={classes.ChannelName}>{currentChannel.name}</h1>
            <button className={classes.UsersBtn} onClick={props.showUsers}></button>
        </div>
    )

    const desktopToolbar = (
        <div className={classes.Toolbar}>
            <div className={classes.Hashtag}>#</div>
            <h1 className={classes.ChannelName}>{currentChannel.name}</h1>
            <div className={classes.Divider}>|</div>
            <p className={classes.ChannelDesc}>{currentChannel.desc}</p>
        </div>
    )

    return props.isDesktop ? desktopToolbar : mobileToolbar

}

export default Toolbar