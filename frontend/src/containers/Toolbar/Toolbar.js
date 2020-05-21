import React, { useState } from 'react'

import Settings from '../Settings/Settings.js'
import Channels from '../../components/Channels/Channels.js'
import Backdrop from '../../components/Backdrop/Backdrop.js'

const Toolbar = props => {
    const [showChannels, setshowChannels] = useState(false)

    const handleBackdrop = () => {
        setshowChannels(false)
    }

    return (
        <div className="toolbar">
            <Backdrop show={showChannels} click={handleBackdrop} />
            <button
                className="channels-btn"
                onClick={setshowChannels.bind(this, !showChannels)}
            >Channels</button>
            <Channels show={showChannels} />
            <h1>Channel name</h1>
            <Settings />
        </div>
    )
}

export default Toolbar