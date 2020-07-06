import React, { useState, useEffect } from 'react';

import classes from './Channels.module.css'

// grpc
import { ChatClient } from '../../client/grpc_clients.js';
import { EmptyMessage } from '../../proto/chat/chat_pb.js'

// components
import Channel from './Channel/Channel.js'
import ChannelsHeader from './ChannelsHeader/ChannelsHeader.js';
import SettingsBar from '../SettingsBar/SettingsBar.js';
import NewChannelModal from './NewChannelModal/NewChannelModal.js';

const Channels = props => {
    const [showModal, setShowModal] = useState(false)
    const [channels, setChannels] = useState(null)

    const getChannels = async () => {
        // load channels
        try {
            const req = new EmptyMessage()
            const res = await ChatClient.getChannels(req, {})
            console.log(res.getChannelsList())
            const newChannels = res.getChannelsList().map(channel =>
                <Channel
                    key={channel.getId()}
                    name={channel.getName()}
                    desc={channel.getDescription()}
                    owner={channel.getOwner()}
                />
            )
            setChannels(newChannels)
            console.log('cd', newChannels)
        }
        catch (err) {
            console.log('error loading channels:', err)
            // send to 404 page
        }
    }

    // load channels on initial render only
    useEffect(() => {
        getChannels()
    }, [])

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