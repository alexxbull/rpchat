import React from 'react'

import classes from './Modal.module.css'
import Backdrop from '../Backdrop/Backdrop'


const Modal = props => {
    const modalClasses = [classes.Modal]
    let backdrop = null

    if (props.show) {
        modalClasses.push(classes.Open)
        backdrop = <Backdrop click={props.exit} show={props.show && props.isDesktop} />
    }

    return (
        <>
            {backdrop}
            <div className={modalClasses.join(' ')}>
                <header>
                    <h1 className={classes.Title}>{props.title}</h1>
                    <div className={classes.CloseBtnContainer}><button className={classes.CloseBtn} onClick={props.exit}></button></div>
                </header>
                <div>{props.children}</div>
                <button className={classes.OkayBtn} onClick={props.click}>{props.submitText}</button>
            </div>
        </>
    )
}

export default Modal