import React, { useState } from 'react';

import classes from './Channels.module.css'

import Channel from './Channel/Channel.js'
import ChannelsHeader from './ChannelsHeader/ChannelsHeader.js';
import SettingsBar from '../SettingsBar/SettingsBar';
import Modal from '../Modal/Modal.js';

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
            <Modal
                show={showModal}
                title={"Create Channel"}
                exit={setShowModal.bind(this, false)}
                submitText={"Submit"}
                isDesktop={props.isDesktop}
            >
                <form className={classes.AddChannelForm}>
                    <label htmlFor="Channel Name">Name:</label>
                    <input type="text" name={"ChannelName"} placeholder={"Channel name"} />

                    <label htmlFor="Channel Description">Description:</label>
                    <input type="text" name={"Channel Description"} placeholder={"Describe the topics of this channel"} />
                </form>
            </Modal>
        </>
    )
}

export default Channels;