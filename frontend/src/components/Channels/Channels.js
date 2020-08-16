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
import Spinner from '../Spinner/Spinner.js';
import { useHistory } from 'react-router-dom';

const Channels = props => {
    const { state, dispatch } = useContext(StoreContext)
    const history = useHistory()
    const [loading, setLoading] = useState(true)
    const { isDesktop, show } = props
    const initialChannelOptions = {
        classes: [classes.ChannelOptions],
        editChannel: false,
        deleteChannel: false,
        deleteChannelError: '',
        targetChannel: null,
    }
    const [channelOptions, setChannelOptions] = useState(initialChannelOptions)

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
                    console.error('error loading channels:', err)
                    history.push('/error')
                }
            }
        )()
    }, [dispatch, history, state.accessToken])

    // hide channel options when on desktop
    useEffect(() => {
        if (!show || isDesktop)
            setChannelOptions(opts => ({ ...opts, classes: [classes.ChannelOptions] }))
    }, [show, setChannelOptions, isDesktop])

    const channelsClasses = [classes.Channels]
    if (show)
        channelsClasses.push(classes.Open)

    let spinner = null
    if (loading)
        spinner = <Spinner />

    const [showNewChannelModal, setShowNewChannelModal] = useState(false)
    const newChannelModal = (
        <ChannelModal
            close={setShowNewChannelModal.bind(this, false)}
            isDesktop={isDesktop}
            modalType={'new'}
            show={showNewChannelModal}
            title={'Create Channel'}
        />
    )

    let editModal = null
    if (channelOptions.editChannel) {
        editModal = (
            <ChannelModal
                channel={channelOptions.targetChannel}
                close={() => setChannelOptions(initialChannelOptions)}
                isDesktop={isDesktop}
                modalType={'edit'}
                show={true}
                title={'Edit Channel'}
            />
        )
    }

    let deleteModal = null
    if (channelOptions.deleteChannel) {
        deleteModal = (
            <ChannelModal
                channel={channelOptions.targetChannel}
                close={() => setChannelOptions({ ...initialChannelOptions })}
                isDesktop={isDesktop}
                modalType={'delete'}
                show={true}
                title={'Delete Channel'}
            />
        )
    }

    // highlight on touch/longpress
    const touchHighlight = {
        onTouchStart: event => event.target.classList.add(classes.Highlight),
        onTouchEnd: event => event.target.classList.remove(classes.Highlight),
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
                            deleteChannel={() => setChannelOptions(opts => ({ ...opts, deleteChannel: true, targetChannel: channel }))}
                            editChannel={() => setChannelOptions(opts => ({ ...opts, targetChannel: channel, editChannel: true }))}
                            isDesktop={isDesktop}
                            showChannelOptions={() => setChannelOptions(opts => ({ ...opts, targetChannel: channel, classes: [classes.ChannelOptions, classes.ShowOptions] }))}
                        />
                    )}
                </ul>
                <SettingsBar />
            </div>
            {newChannelModal}
            {editModal}
            {deleteModal}
            <ul className={channelOptions.classes.join(' ')}>
                <li
                    className={[classes.ChannelOption]}
                    onClick={() => setChannelOptions({ ...channelOptions, classes: [classes.ChannelOption], editChannel: true })}
                    {...touchHighlight}
                >Edit Channel
                </li>
                <li
                    className={[classes.ChannelOption]}
                    onClick={() => setChannelOptions({ ...channelOptions, classes: [classes.ChannelOption], deleteChannel: true })}
                    {...touchHighlight}
                >Delete Channel
                </li>
            </ul>
        </>
    )
}

export default Channels;