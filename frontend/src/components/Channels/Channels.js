import React, { useState } from 'react';

import classes from './Channels.module.css'

import Channel from './Channel/Channel.js'
import ChannelsHeader from './ChannelsHeader/ChannelsHeader.js';
import SettingsBar from '../SettingsBar/SettingsBar.js';
import NewChannelModal from './NewChannelModal/NewChannelModal.js';

const Channels = props => {
    const [showModal, setShowModal] = useState(false)

    const channelsData = [
        { name: "Channel1", id: 1 },
        { name: "Channel2", id: 2 },
        { name: "Channel3", id: 3 },
    ]

    const channels = channelsData.map(channel =>
        <Channel
            key={channel.id}
            name={channel.name}
        />
    )

    const channelsClasses = [classes.Channels]
    if (props.show) {
        channelsClasses.push(classes.Open)
    }

    return (
        <>
            <div className={channelsClasses.join(' ')}>
                <ChannelsHeader displayModal={setShowModal.bind(this, true)} />
                <ul className={classes.Channels__list}>
                    {channels}
                </ul>
                <SettingsBar />
            </div>
            <NewChannelModal show={showModal} close={setShowModal.bind(this, false)} isDesktop={props.isDesktop} />
        </>
    )
}

export default Channels;