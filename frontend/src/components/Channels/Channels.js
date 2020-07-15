// js libraries
import React, { useContext, useEffect, useState } from 'react';

// css
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

    // load channels after initial render
    useEffect(() => {
        (
            async () => {
                // load channels
                try {
                    const req = new EmptyMessage()
                    const chatClient = ChatClient(dispatch)
                    const res = await chatClient.getChannels(req, {})
                    let currentChannel = null
                    const newChannels = res.getChannelsList().map((channel, index) => {
                        const ch = {
                            id: channel.getId(),
                            name: channel.getName(),
                            desc: channel.getDescription(),
                            owner: channel.getOwner(),
                            active: index === 0 ? true : false // set the first channel as the current channel
                        }
                        if (ch.active)
                            currentChannel = ch

                        return ch
                    })

                    dispatch({ type: 'set-channels', payload: { channels: newChannels, currentChannel: currentChannel } })
                    setLoading(false)
                }
                catch (err) {
                    console.log('error loading channels:', err)
                    // send to 404 page
                }
            }
        )()
    }, [dispatch, state.accessToken])

    const channelsClasses = [classes.Channels]
    if (props.show)
        channelsClasses.push(classes.Open)

    let spinner = null
    if (loading)
        spinner = <Spinner />

    return (
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
    )
}

export default Channels;