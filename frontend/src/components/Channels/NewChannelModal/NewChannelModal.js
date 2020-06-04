import React, { useState } from 'react'

import classes from './NewChannelModal.module.css'

import Modal from '../../Modal/Modal.js'
import { NewChannelRequest } from '../../../proto/chat_pb.js'
import { ChatServiceClient } from '../../../proto/chat_grpc_web_pb.js'

const hostname = 'http://localhost:8080'

const NewChannelModal = props => {
    const blankChannel = {
        name: '',
        desc: '',
        owner: 'TestUser',
        error: ''
    }
    const [newChannel, setNewChannel] = useState(blankChannel)

    const inputChangeHandler = event => {
        const eventName = event.target.name
        setNewChannel({ ...newChannel, [eventName]: event.target.value, error: '' })
    }

    const handleModalClose = () => {
        setNewChannel(blankChannel)
        props.close()
    }

    const handleSubmit = event => {
        event.preventDefault()
        console.log('attempting to add new channel')

        const client = new ChatServiceClient(hostname)
        const req = new NewChannelRequest()
        req.setName(newChannel.name)
        req.setDescription(newChannel.desc)
        req.setOwner(newChannel.owner)

        client.addChannel(req, {}, (err, res) => {
            if (err) {
                console.log(err)
                setNewChannel({ ...newChannel, error: err.message })
            }
            if (res) {
                console.log('form submitted')
                handleModalClose()
            }
        })
    }

    return (
        <Modal
            error={newChannel.error}
            show={props.show}
            title={"Create Channel"}
            close={handleModalClose}
            isDesktop={props.isDesktop}
            formID={classes.NewChannelModal}
            okayBtn={<input className={classes.SubmitBtn} type="submit" onSubmit={props.click} value={props.submitText} form={classes.NewChannelModal} />}
        >
            <form id={classes.NewChannelModal} onSubmit={handleSubmit}>
                <label htmlFor="Channel Name">Name:</label>
                <input required type="text" placeholder={"Channel name"} name={"name"} value={newChannel.name} onChange={inputChangeHandler} pattern={"^(?!\\s*$).+"} title={"Channel name cannot only be whitespace"} />

                <label htmlFor="Channel Description">Description:</label>
                <input type="text" placeholder={"Describe the topics of this channel"} name={"desc"} value={newChannel.desc} onChange={inputChangeHandler} />
            </form>
        </Modal>
    )
}

export default NewChannelModal