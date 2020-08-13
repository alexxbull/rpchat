import React from 'react'

import classes from './Modal.module.css'

import Backdrop from '../Backdrop/Backdrop'


const Modal = props => {
    const modalClasses = [classes.Modal]
    let backdrop = null

    if (props.show) {
        modalClasses.push(classes.Open)
        if (props.autoHeight)
            modalClasses.push(classes.AutoHeight)
        backdrop = <Backdrop click={props.close} show={props.show && props.isDesktop} />
    }

    let okayBtn = <button className={classes.OkayBtn} onClick={props.close}>OK</button>
    if (props.okayBtn)
        okayBtn = props.okayBtn

    const errorClasses = [classes.Error]
    if (props.error)
        errorClasses.push(classes.ShowError)

    return (
        <>
            {backdrop}
            <div className={modalClasses.join(' ')}>
                <div className={errorClasses.join(' ')}>{props.error}</div>
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