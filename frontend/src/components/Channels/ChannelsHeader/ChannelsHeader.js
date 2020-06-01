import React from 'react'

import classes from './ChannelsHeader.module.css'

import Modal from '../../Modal/Modal.js'

const ChannelsHeader = props => {
    const handleModalClose = () => {
        props.showModal(null)
    }

    const handleAddChannel = () => {
        props.showModal(
            <Modal title={"Create Channel"} exit={handleModalClose} submitText={"Submit"}>
                <form className={classes.AddChannelForm}>
                    <label htmlFor="Channel Name">Name:</label>
                    <input type="text" name={"ChannelName"} placeholder={"Channel name"} />

                    <label htmlFor="Channel Description">Description:</label>
                    <input type="text" name={"Channel Description"} placeholder={"Describe the topics of this channel"} />
                </form>
            </Modal>
        )
    }

    return (
        <header className={classes.ChannelsHeader}>
            <div className={classes.Channels_icon}></div>
            <h1 className={classes.ChannelsHeader_title}>Channels</h1>
            <button className={classes.Add_btn} onClick={handleAddChannel}>+</button>
        </header>
    )
}

export default ChannelsHeader