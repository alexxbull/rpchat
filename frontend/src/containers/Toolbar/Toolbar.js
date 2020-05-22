import React, { useState } from 'react'

import classes from './Toolbar.module.css'

import BackdropContext from '../../context/BackdropContext.js'

import Channels from '../../components/Channels/Channels.js'
import Backdrop from '../../components/Backdrop/Backdrop.js'
import Users from '../../components/Users/Users.js'

const Toolbar = props => {
    const [showChannels, setShowChannels] = useState(false)
    const [showUsers, setShowUsers] = useState(false)

    const handleBackdrop = () => {
        showChannels ? setShowChannels(false) : setShowUsers(false)
    }

    return (
        <BackdropContext.Provider value={showChannels}>
            <Backdrop show={showChannels || showUsers} click={handleBackdrop} />
            <div className={classes.Toolbar}>
                <button
                    className={classes.Channels_btn}
                    onClick={setShowChannels.bind(this, !showChannels)}
                >
                    <span className={classes.Channels_btn_bar}></span>
                    <span className={classes.Channels_btn_bar}></span>
                    <span className={classes.Channels_btn_bar}></span>
                </button>
                <Channels show={showChannels} />

                <h1 className={classes.Channel_name}>Current Channel</h1>

                <button className={classes.Users_btn} onClick={setShowUsers.bind(this, !showUsers)}></button>
                <Users show={showUsers} />
            </div>
        </BackdropContext.Provider>
    )
}

export default Toolbar