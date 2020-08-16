import React from 'react'

// css
import classes from './ErrorPage.module.css'

import { ReactComponent as ErrorIcon } from '../../assets/error.svg'

const ErrorPage = props => {

    return (
        <div className={classes.Container}>
            <div className={classes.ErrorPage}>
                <header className={classes.Header}>
                    Oops...something went wrong
                </header>
                <h1>RPChat</h1>
                <ErrorIcon className={classes.ErrorIcon} />
                <div className={classes.Message}>
                    The server is currently down.
                    <br></br>
                    Please try again later.
                </div>
            </div>
        </div>
    )
}

export default ErrorPage