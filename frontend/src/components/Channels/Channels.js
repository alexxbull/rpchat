import React from 'react';

import Channel from './Channel/Channel.js'

const Channels = props => {
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


    return (
        <div className="channels">
            {channels}
        </div>
    )
}

export default Channels;
