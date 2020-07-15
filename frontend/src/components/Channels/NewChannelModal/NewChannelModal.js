import React, { useContext, useState } from 'react'

import classes from './NewChannelModal.module.css'

// context
import { StoreContext } from '../../../context/Store'

// grpc
import { ChatClient } from '../../../client/grpc_clients.js'
import { NewChannelRequest } from '../../../proto/chat/chat_pb.js'

// copmponents
import Modal from '../../Modal/Modal.js'

const NewChannelModal = props => {
    const { dispatch, state } = useContext(StoreContext)
    const blankChannel = {
        name: '',
        desc: '',
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

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const req = new NewChannelRequest()
            req.setName(newChannel.name)
            req.setDescription(newChannel.desc)
            req.setOwner(state.username)

            const chatClient = ChatClient(dispatch)
            await chatClient.addChannel(req, {})
            handleModalClose()
        }
        catch (err) {
            setNewChannel({ ...newChannel, error: err.message })
        }
    }

    return (
        <Modal
            error={newChannel.error}
            show={props.show}
            title={"Create Channel"}
            close={handleModalClose}
            isDesktop={props.isDesktop}
            formID={classes.NewChannelModal}
            okayBtn={<input className={classes.SubmitBtn} type="submit" onSubmit={props.click} value={"Submit"} form={classes.NewChannelModal} />}
        >
            <form id={classes.NewChannelModal} onSubmit={handleSubmit}>
                <label htmlFor="Channel Name">Name:</label>
                {/* FIXME  fix required highlight showing on input box after modal closes*/}
                <input required type="text" placeholder={"Channel name"} name={"name"} value={newChannel.name} onChange={inputChangeHandler} pattern={"^(?!\\s*$).+"} title={"Channel name cannot only be whitespace"} />

                <label htmlFor="Channel Description">Description:</label>
                <input type="text" placeholder={"Describe the topics of this channel"} name={"desc"} value={newChannel.desc} onChange={inputChangeHandler} />
            </form>
        </Modal>
    )
}

export default NewChannelModal