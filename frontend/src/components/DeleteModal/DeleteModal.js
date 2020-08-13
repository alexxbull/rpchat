import React from 'react'

// css
import classes from './DeleteModal.module.css'

// components
import Modal from '../Modal/Modal'

const DeleteModal = props => {
    return (
        <Modal
            autoHeight={props.autoHeight}
            error={props.error}
            show={props.show}
            title={props.title}
            close={props.close}
            isDesktop={props.isDesktop}
            okayBtn={<button className={classes.SubmitBtn} onClick={props.submit}>Yes</button>}
        >
            <div className={classes.DeleteModal}>
                <p>{props.content}</p>
            </div>
        </Modal>
    )
}

export default DeleteModal