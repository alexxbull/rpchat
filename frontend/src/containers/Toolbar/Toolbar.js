import React, { useState } from 'react'

import Channels from '../../components/Channels/Channels.js'
import Backdrop from '../../components/Backdrop/Backdrop.js'

import classes from './Toolbar.module.css'

const Toolbar = props => {
    const [showChannels, setshowChannels] = useState(false)

    const handleBackdrop = () => {
        setshowChannels(false)
    }

    return (
        <>
            <Backdrop show={showChannels} click={handleBackdrop} />
            <div className={classes.Toolbar}>
                <button
                    className={classes.Channels_btn}
                    onClick={setshowChannels.bind(this, !showChannels)}
                >
                    <span class={classes.Channels_btn_bar}></span>
                    <span class={classes.Channels_btn_bar}></span>
                    <span class={classes.Channels_btn_bar}></span>
                </button>
                <Channels show={showChannels} />
                <h1 className={classes.Channel_name}>Current Channel</h1>
            </div>
        </>
    )
}

export default Toolbar