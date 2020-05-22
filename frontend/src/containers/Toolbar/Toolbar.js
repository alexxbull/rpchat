import React, { useState } from 'react'

import classes from './Toolbar.module.css'

import Channels from '../../components/Channels/Channels.js'
import Backdrop from '../../components/Backdrop/Backdrop.js'

import BackdropContext from '../../context/BackdropContext.js'

const Toolbar = props => {
    const [showChannels, setshowChannels] = useState(false)

    const handleBackdrop = () => {
        setshowChannels(false)
    }

    return (
        <BackdropContext.Provider value={showChannels}>
            <Backdrop show={showChannels} click={handleBackdrop} />
            <div className={classes.Toolbar}>
                <button
                    className={classes.Channels_btn}
                    onClick={setshowChannels.bind(this, !showChannels)}
                >
                    <span className={classes.Channels_btn_bar}></span>
                    <span className={classes.Channels_btn_bar}></span>
                    <span className={classes.Channels_btn_bar}></span>
                </button>
                <Channels show={showChannels} />
                <h1 className={classes.Channel_name}>Current Channel</h1>
            </div>
        </BackdropContext.Provider>
    )
}

export default Toolbar