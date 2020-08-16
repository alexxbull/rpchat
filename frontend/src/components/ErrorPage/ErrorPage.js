import React from 'react'
import { Link, useHistory } from 'react-router-dom'

// css
import classes from './ErrorPage.module.css'

import { ReactComponent as ErrorIcon } from '../../assets/error-icon.svg'

const ErrorPage = props => {
    const history = useHistory()

    // highlight on touch/longpress
    const touchHighlight = {
        onTouchStart: event => event.target.classList.add(classes.Highlight),
        onTouchEnd: event => event.target.classList.remove(classes.Highlight),
    }
    return (
        <div className={classes.Container}>
            <div className={classes.ErrorPage}>
                <header className={classes.Header}>
                    <nav>
                        <ul className={classes.Links}>
                            <li className={classes.Link}><Link to="/">Home</Link></li>
                            <li className={classes.Link}><Link to="/chat">Chat</Link></li>
                        </ul>
                    </nav>
                    <div className={classes.ErrorMessage}>Oops...something went wrong</div>
                </header>
                <h1>RPChat</h1>
                <ErrorIcon className={classes.ErrorIcon} />

                <div className={classes.Message}>
                    The server is currently down.
                    <br></br>
                    Please try again later.
                </div>

                <div className={classes.Buttons}>
                    <button className={classes.Button} {...touchHighlight} onClick={() => history.push('/')}>Homepage</button>
                    <button className={classes.Button} {...touchHighlight} onClick={() => history.push('/chat')}>Chat</button>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage