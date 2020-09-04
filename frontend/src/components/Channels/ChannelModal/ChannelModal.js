import React, { useContext, useState } from 'react'

import classes from './ChannelModal.module.css'

// context
import { StoreContext } from '../../../context/Store'

// grpc
import { ChatClient } from '../../../client/grpc_clients.js'
import { DeleteChannelRequest, EditChannelRequest, NewChannelRequest } from '../../../proto/chat/chat_pb.js'

// copmponents
import Modal from '../../Modal/Modal.js'

const ChannelModal = props => {
    const { dispatch, state } = useContext(StoreContext)

    const existingChannel = { ...props.channel }
    const newChannel = {
        desc: '',
        error: '',
        id: null,
        name: '',
    }
    const [channel, setChannel] = useState(props.modalType === 'new' ? newChannel : existingChannel)
    const submitButtonClasses = props.modalType === 'delete' ? [classes.SubmitBtn, classes.BackgroundRed] : [classes.SubmitBtn]

    const inputChangeHandler = event => {
        const eventName = event.target.name
        setChannel({ ...channel, [eventName]: event.target.value, error: '' })
    }

    const handleModalClose = () => {
        setChannel(newChannel)
        props.close()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        switch (props.modalType) {
            case 'new':
                try {
                    const req = new NewChannelRequest()
                    req.setName(channel.name)
                    req.setDescription(channel.desc)
                    req.setOwner(state.username)

                    const chatClient = ChatClient(dispatch)
                    await chatClient.addChannel(req, {})
                    handleModalClose()
                }
                catch (err) {
                    setChannel(channelState => ({ ...channelState, error: err.message }))
                }
                break
            case 'edit':
                try {
                    const req = new EditChannelRequest()
                    req.setId(channel.id)
                    req.setName(channel.name)
                    req.setDescription(channel.desc)
                    req.setOwner(state.username)

                    const chatClient = ChatClient(dispatch)
                    await chatClient.editChannel(req, {})
                    handleModalClose()
                }
                catch (err) {
                    setChannel(channelState => ({ ...channelState, error: err.message }))
                }
                break
            case 'delete':
                try {
                    const req = new DeleteChannelRequest()
                    req.setId(channel.id)
                    req.setName(channel.name)
                    req.setUsername(state.username)

                    const chatClient = ChatClient(dispatch)
                    await chatClient.deleteChannel(req, {})
                    handleModalClose()
                }
                catch (err) {
                    setChannel(channelState => ({ ...channelState, error: err.message }))
                }
                break
            default:
                const err = `Unknown channel modalType: ${props.modalType}`
                setChannel(channelState => ({ ...channelState, error: err }))
                break
        }
    }

    return (
        <Modal
            error={channel.error}
            show={props.show}
            title={props.title}
            close={handleModalClose}
            isDesktop={props.isDesktop}
            formID={`${props.modalType}_${classes.ChannelModal}`}
            okayBtn={
                <input className={submitButtonClasses.join(' ')}
                    type={"submit"}
                    onSubmit={props.click}
                    value={"Submit"}
                    form={`${props.modalType}_${classes.ChannelModal}`}
                />
            }
        >
            <form id={`${props.modalType}_${classes.ChannelModal}`} className={classes.ChannelModal} onSubmit={handleSubmit}>
                <label htmlFor="Channel Name">Name:</label>
                {/* FIXME  fix required highlight showing on input box after modal closes*/}
                <input
                    required
                    type="text"
                    placeholder={"Channel name"}
                    name={"name"}
                    value={channel.name}
                    onChange={inputChangeHandler}
                    pattern={"^(?!\\s*$).+"}
                    title={"Channel name cannot only be whitespace"}
                    readOnly={props.modalType === 'delete' ? true : false}
                />

                <label htmlFor="Channel Description">Description:</label>
                <input
                    type="text"
                    placeholder={"Describe the topics of this channel"}
                    name={"desc"}
                    value={channel.desc}
                    onChange={inputChangeHandler}
                    readOnly={props.modalType === 'delete' ? true : false}
                />
            </form>
        </Modal>
    )
}

export default ChannelModal