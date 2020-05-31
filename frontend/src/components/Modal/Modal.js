import React from 'react'

import classes from './Modal.module.css'
import Backdrop from '../Backdrop/Backdrop'


const Modal = props => {
    return (
        <>
            <Backdrop click={props.exit} show={true} />
            <div className={classes.Modal}>

                <button className={classes.CloseBtn} onClick={props.exit}>X</button>
                <div>{props.children}</div>
                <button className={classes.OkayBtn} onClick={props.click}>{props.submitText}</button>
            </div>
        </>
    )
}

export default Modal