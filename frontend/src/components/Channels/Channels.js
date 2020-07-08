import React, { useContext, useEffect, useMemo, useState } from 'react';

import classes from './Channels.module.css'

// grpc
import { ChatClient } from '../../client/grpc_clients.js';
import { EmptyMessage } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store';

// components
import Channel from './Channel/Channel.js'
import ChannelsHeader from './ChannelsHeader/ChannelsHeader.js';
import SettingsBar from '../SettingsBar/SettingsBar.js';
import NewChannelModal from './NewChannelModal/NewChannelModal.js';
import Spinner from '../Spinner/Spinner';


const Channels = props => {
    const { state, dispatch } = useContext(StoreContext)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    const getChannels = async () => {
        // load channels
        try {
            const req = new EmptyMessage()
            const res = await ChatClient.getChannels(req, {})
            const newChannels = res.getChannelsList().map((channel, index) => {
                return {
                    id: channel.getId(),
                    name: channel.getName(),
                    desc: channel.getDescription(),
                    owner: channel.getOwner(),
                    active: index === 0 ? true : false // set the first channel as the current channel
                }
            })
            dispatch({ type: 'set-channels', payload: newChannels })
            setLoading(false)
        }
        catch (err) {
            console.log('error loading channels:', err)
            // send to 404 page
        }
    }

    // load channels on initial render
    useEffect(() => {
        getChannels()
    }, [])

    const channelsClasses = [classes.Channels]
    if (props.show) {
        channelsClasses.push(classes.Open)
    }

    let spinner = null
    if (loading) {
        spinner = <Spinner />
    }

    return useMemo(() =>
        <>
            <div className={channelsClasses.join(' ')}>
                <ChannelsHeader displayModal={setShowModal.bind(this, true)} />
                <ul className={classes.Channels__list}>
                    {spinner}
                    {state.channels.map(channel =>
                        <Channel
                            key={channel.id}
                            name={channel.name}
                            desc={channel.desc}
                            owner={channel.owner}
                            active={channel.active}
                        />
                    )}
                </ul>
                <SettingsBar />
            </div>
            <NewChannelModal show={showModal} close={setShowModal.bind(this, false)} isDesktop={props.isDesktop} />
        </>
        , [props.show, state.channels, dispatch, loading])
}

export default Channels;