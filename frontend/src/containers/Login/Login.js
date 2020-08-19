import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import classes from './Login.module.css'

// grpc
import { AuthClient } from '../../client/grpc_clients.js'
import { LoginRequest } from '../../proto/auth/auth_pb.js'

// context
import { StoreContext } from '../../context/Store'

const Login = props => {
    const { dispatch } = useContext(StoreContext)
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

    const handleLogin = async (event) => {
        event.preventDefault()

        if (!username.value)
            setUsername({ ...username, styles: [classes.Username, classes.InputError] })

        if (!password.value)
            setPassword({ ...password, styles: [classes.Password, classes.InputError] })

        if (username.value && password.value) {
            try {
                const req = new LoginRequest()
                req.setUsername(username.value)
                req.setPassword(password.value)

                const authClient = AuthClient(dispatch)
                await authClient.login(req, {})
                props.history.push('/chat')
            }
            catch (err) {
                console.error('login err', err.message)
                setError(err.message)
            }
        }
        else {
            setError('Invalid login information')
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
                <div className={classes.RegisterLink}><Link to="/register">Create an account</Link></div>
            </div>
        </div>
    )
}

export default Login