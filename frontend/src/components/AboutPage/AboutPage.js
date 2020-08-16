import React from 'react'
import { useHistory, Link } from 'react-router-dom'

// css
import classes from './AboutPage.module.css'

// components
import { ReactComponent as ReceiptIcon } from '../../assets/receipt-icon.svg'
import { ReactComponent as SourceIcon } from '../../assets/source-icon.svg'

const AboutPage = props => {
    const history = useHistory()

    // highlight on touch/longpress
    const touchHighlight = {
        onTouchStart: event => event.target.classList.add(classes.Highlight),
        onTouchEnd: event => event.target.classList.remove(classes.Highlight),
    }

    return (
        <div className={classes.Container}>
            <div className={classes.AboutPage}>
                <nav>
                    <ul className={classes.Links}>
                        <li className={classes.Link}><Link to="/">Home</Link></li>
                        <li className={classes.Link}><Link to="/chat">Chat</Link></li>
                    </ul>
                </nav>
                <h1>RPChat</h1>

                <div className={classes.Source}>
                    <header><SourceIcon className={classes.SourceIcon} /> <b>Source</b></header>
                    <p>
                        Hi, this website was created by Alexx Bull.
                        Source code for this project can be found <a href="https://github.com/alexxbull/rpchat">here</a>.
                     </p>
                </div>

                <div className={classes.Credits}>
                    <header><ReceiptIcon className={classes.ReceiptIcon} /> <b>Credits</b></header>
                    <ul>
                        <li>Icons created by <a href="https://material.io/">material.io</a>.</li>
                        <li>Front end written in <a href="https://reactjs.org/">React</a>.</li>
                        <li>Realtime chat activity implemented via <a href="https://grpc.io/">grpc</a> and <a href="https://github.com/grpc/grpc-web">grpc-web</a>.</li>
                    </ul>
                </div>

                <div className={classes.Buttons}>
                    <button className={classes.Button} {...touchHighlight} onClick={() => history.push('/')}>Homepage</button>
                    <button className={classes.Button} {...touchHighlight} onClick={() => history.push('/chat')}>Chat</button>
                </div>
            </div>
        </div>
    )
}

export default AboutPage