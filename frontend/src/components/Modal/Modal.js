import React from 'react'

import classes from './Modal.module.css'

import Backdrop from '../Backdrop/Backdrop'


const Modal = props => {
    const modalClasses = [classes.Modal]
    let backdrop = null

    if (props.show) {
        modalClasses.push(classes.Open)
        backdrop = <Backdrop click={props.close} show={props.show && props.isDesktop} />
    }

    let okayBtn = <button className={classes.OkayBtn} onClick={props.close}>OK</button>
    if (props.okayBtn)
        okayBtn = props.okayBtn

    return (
        <>
            {backdrop}
            <div className={modalClasses.join(' ')}>
                <header>
                    <h1 className={classes.Title}>{props.title}</h1>
                    <div className={classes.CloseBtnContainer}><button className={classes.CloseBtn} onClick={props.close}></button></div>
                </header>
                <div>{props.children}</div>
                {okayBtn}
            </div>
        </>
    )
}

export default Modal