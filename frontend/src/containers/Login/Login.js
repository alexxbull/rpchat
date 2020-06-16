import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import classes from './Login.module.css'
import { ChatServiceClient } from '../../proto/chat_grpc_web_pb.js'
import { ConnectRequest } from '../../proto/chat_pb.js'

const hostname = 'https://localhost:443'

const Login = props => {
    const [error, setError] = useState('')
    const [username, setUsername] = useState({ value: '', styles: [classes.Username] })
    const [password, setPassword] = useState({ value: '', styles: [classes.Password] })

    const handleInput = event => {
        switch (event.target.name) {
            case "username":
                setUsername({ value: event.target.value, styles: [classes.Username] })
                break
            case "password":
                setPassword({ value: event.target.value, styles: [classes.Password] })
                break
            default:
                break
        }
        if (error)
            setError('')
    }

    const handleLogin = event => {
        event.preventDefault()

        if (!username.value)
            setUsername({ ...username, styles: [classes.Username, classes.InputError] })

        if (!password.value)
            setPassword({ ...password, styles: [classes.Password, classes.InputError] })

        if (username.value && password.value) {
            console.log('attempt login')
            const client = new ChatServiceClient(hostname)
            const req = new ConnectRequest()

            req.setUser("TestUser")
            const stream = client.connect(req, {})
            console.log('login')
            console.log(stream)
        }
        else {
            setError('Invalid login')
        }
    }

    const errorClasses = [classes.Error]
    if (error)
        errorClasses.push(classes.ShowError)

    return (
        <div className={classes.Container}>
            <div className={classes.Login}>
                <div className={errorClasses.join(' ')}>{error}</div>
                <h1>RPChat</h1>
                <form className={classes.Login_Form} onSubmit={handleLogin}>
                    <label htmlFor="Username">Username</label>
                    <input className={username.styles.join(' ')} type="text" placeholder="Enter username" name="username" value={username.value} onChange={handleInput} />

                    <label htmlFor="password">Password</label>
                    <input className={password.styles.join(' ')} type="password" placeholder="Enter password" name="password" value={password.value} onChange={handleInput} />

                    <input className={classes.LoginBtn} type="submit" value="LOG IN" />
                </form>
                <div className={classes.RegisterLink}><Link to="/signup">Create an account</Link></div>
            </div>
        </div>
    )
}

export default Login