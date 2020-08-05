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
import ChannelModal from './ChannelModal/ChannelModal.js';
import Spinner from '../Spinner/Spinner';

const Channels = props => {
    const { state, dispatch } = useContext(StoreContext)
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

    const [showNewChannelModal, setShowNewChannelModal] = useState(false)
    const newChannelModal = (
        <ChannelModal
            close={setShowNewChannelModal.bind(this, false)}
            isDesktop={props.isDesktop}
            modalType={'new'}
            show={showNewChannelModal}
            title={'Create Channel'}
        />
    )

    const initialChannelOptions = {
        channel: state.channels[0],
        classes: classes,
        optionsClasses: [classes.ChannelOptions],
        showEdit: false,
        startLongPress: false,
        channelOptionClasses: [classes.ChannelOption],
    }
    const [channelOptions, setChannelOptions] = useState(initialChannelOptions)

    let editModal = null
    if (channelOptions.showEdit) {
        editModal = <ChannelModal
            channel={channelOptions.channel}
            close={() => setChannelOptions(initialChannelOptions)}
            isDesktop={props.isDesktop}
            modalType={'edit'}
            show={true}
            title={'Edit Channel'}
        />
    }

    useEffect(() => {
        if (!props.show || props.isDesktop)
            setChannelOptions(opts => ({ ...opts, optionsClasses: [classes.ChannelOptions] }))
    }, [props.show, setChannelOptions, props.isDesktop])


    // highlight on touch/longpress
    const touchHighlight = {
        onTouchStart: () => setChannelOptions({ ...channelOptions, channelOptionClasses: [classes.ChannelOption, classes.Highlight] }),
        onTouchEnd: () => setChannelOptions({ ...channelOptions, channelOptionClasses: [classes.ChannelOption] }),
    }
    return (
        <>
            <div className={channelsClasses.join(' ')}>
                <ChannelsHeader displayModal={setShowNewChannelModal.bind(this, true)} />
                <ul className={classes.Channels__list}>
                    {spinner}
                    {state.channels.map(channel =>
                        <Channel
                            id={channel.id}
                            key={channel.id}
                            name={channel.name}
                            desc={channel.desc}
                            owner={channel.owner}
                            active={channel.active}
                            setChannelOptions={setChannelOptions}
                            isDesktop={props.isDesktop}
                        />
                    )}
                </ul>
                <SettingsBar />
            </div>
            {newChannelModal}
            {editModal}
            <ul className={channelOptions.optionsClasses.join(' ')}>
                <button
                    className={channelOptions.channelOptionClasses.join(' ')}
                    onClick={() => setChannelOptions({ ...channelOptions, optionsClasses: [classes.ChannelOption], showEdit: true })}
                    {...touchHighlight}
                >Edit Channel
                </button>
            </ul>
        </>
    )
}

export default Channels;