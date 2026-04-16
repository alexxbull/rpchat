import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

// css
import classes from './ErrorPage.module.css'

import ErrorIcon from '../../assets/error-icon.svg?react'

const ErrorPage = props => {
    const navigate = useNavigate()

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
                    <button className={classes.Button} {...touchHighlight} onClick={() => navigate('/')}>Homepage</button>
                    <button className={classes.Button} {...touchHighlight} onClick={() => navigate('/chat')}>Chat</button>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage