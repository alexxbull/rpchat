import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import classes from './Register.module.css'

// grpc
import { RegisterRequest } from '../../proto/auth/auth_pb.js'
import { AuthClient } from '../../client/grpc_clients.js'

// context
import { StoreContext } from '../../context/Store'

const Register = props => {
    const { dispatch } = useContext(StoreContext)
    const [error, setError] = useState('')
    const [email, setEmail] = useState({ value: '', styles: [classes.Email] })
    const [username, setUsername] = useState({ value: '', styles: [classes.Username] })
    const [password, setPassword] = useState({ value: '', styles: [classes.Password] })

    const handleInput = event => {
        switch (event.target.name) {
            case "email":
                setEmail({ value: event.target.value, styles: [classes.Email] })
                break
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

    const handleRegister = async (event) => {
        event.preventDefault()

        if (!email.value)
            setEmail({ ...email, styles: [classes.Email, classes.InputError] })

        if (!username.value)
            setUsername({ ...username, styles: [classes.Username, classes.InputError] })

        if (!password.value)
            setPassword({ ...password, styles: [classes.Password, classes.InputError] })

        if (email.value && username.value && password.value) {
            try {
                const req = new RegisterRequest()
                req.setEmail(email.value)
                req.setUsername(username.value)
                req.setPassword(password.value)

                const authClient = AuthClient(dispatch)
                await authClient.register(req, {})
                props.history.push('/chat')
            }
            catch (err) {
                console.error('reg err', err.message)
                setError(err.message)
            }
        }
        else {
            setError('Invalid registration information')
        }
    }


    const errorClasses = [classes.Error]
    if (error)
        errorClasses.push(classes.ShowError)

    return (
        <div className={classes.Container}>
            <div className={classes.Register}>
                <div className={errorClasses.join(' ')}>{error}</div>
                <h1>RPChat</h1>
                <form className={classes.Register_Form} onSubmit={handleRegister}>
                    <label htmlFor="email">Email</label>
                    <input className={email.styles.join(' ')} type="email" placeholder="Enter email" name="email" value={email.value} onChange={handleInput} />

                    <label htmlFor="username">Username</label>
                    <input className={username.styles.join(' ')} type="text" placeholder="Enter username" name="username" value={username.value} onChange={handleInput} />

                    <label htmlFor="password">Password</label>
                    <input className={password.styles.join(' ')} type="password" placeholder="Enter password" name="password" value={password.value} onChange={handleInput} />

                    <input className={classes.RegisterBtn} type="submit" value="SIGN UP" />
                </form>
                <div className={classes.LoginLink}>
                    Already have an account? <Link to="/">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
