import React from 'react';

import classes from './Channels.module.css'

import Channel from './Channel/Channel.js'
import ChannelsHeader from './ChannelsHeader/ChannelsHeader.js';


const Channels = props => {
    const channelsData = [
        { name: "Channel1", id: 1 },
        { name: "Channel2", id: 2 },
        { name: "Channel3", id: 3 },
    ]

    let attachedClasses = [classes.Channels, classes.Close]

    let channels = null
    if (props.show) {
        channels = channelsData.map(channel =>
            <Channel
                key={channel.id}
                name={channel.name}
            />
        )

        attachedClasses = [classes.Channels, classes.Open]
    }

    return (
        <div className={attachedClasses.join(' ')}>
            <ChannelsHeader />
            <ul className={classes.Channels__list}>
                {channels}
            </ul>
        </div>
    )
}

export default Channels;