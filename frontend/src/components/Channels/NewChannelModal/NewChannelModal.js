import React from 'react'

import classes from './NewChannelModal.module.css'

import Modal from '../../Modal/Modal'

const NewChannelModal = props => {
    const submitBtn = <input className={classes.SubmitBtn} type="submit" onSubmit={props.click} value={props.submitText} form={classes.NewChannelModal} />

    const handleSubmit = event => {
        event.preventDefault()

        console.log('form submitted')
        props.close()
    }

    return (
        <Modal
            show={props.show}
            title={"Create Channel"}
            close={props.close}
            isDesktop={props.isDesktop}
            formID={classes.NewChannelModal}
            okayBtn={submitBtn}
        >
            <form id={classes.NewChannelModal} onSubmit={handleSubmit}>
                <label htmlFor="Channel Name">Name:</label>
                <input required type="text" name={"ChannelName"} placeholder={"Channel name"} pattern={"^(?!\\s*$).+"} title={"Channel name cannot only be whitespace"} />

                <label htmlFor="Channel Description">Description:</label>
                <input type="text" name={"Channel Description"} placeholder={"Describe the topics of this channel"} />
            </form>
        </Modal>
    )
}

export default NewChannelModal