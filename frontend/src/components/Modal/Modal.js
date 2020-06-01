import React from 'react'

import classes from './Modal.module.css'
import Backdrop from '../Backdrop/Backdrop'


const Modal = props => {
    return (
        <>
            <Backdrop click={props.exit} show={true} />
            <div className={classes.Modal}>
                <header>
                    <h1 className={classes.Title}>{props.title}</h1>
                    <div className={classes.Close}><button className={classes.CloseBtn} onClick={props.exit}></button></div>
                </header>
                <div>{props.children}</div>
                <button className={classes.OkayBtn} onClick={props.click}>{props.submitText}</button>
            </div>
        </>
    )
}

export default Modal