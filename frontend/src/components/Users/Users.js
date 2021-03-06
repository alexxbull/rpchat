import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import classes from './Users.module.css';

// grpc
import { ChatClient } from '../../client/grpc_clients.js';
import { EmptyMessage } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store';

// components
import User from './User/User.js'
import UsersHeader from './UsersHeader/UsersHeader';
import Spinner from '../Spinner/Spinner';

const Users = props => {
    const { state, dispatch } = useContext(StoreContext)
    const history = useHistory()
    const [loading, setLoading] = useState(true)

    // load user after initial render only
    useEffect(() => {
        (
            async () => {
                // only load users if user is connected to broadcast stream
                if (state.listening) {
                    // load users
                    try {
                        const req = new EmptyMessage()
                        const chatClient = ChatClient(dispatch)
                        const res = await chatClient.getUsers(req, {})
                        const newUsers = res.getUsersList().map(user => {
                            return {
                                id: user.getId(),
                                name: user.getName(),
                                avatar: user.getAvatar()
                            }
                        })
                        dispatch({ type: 'set-users', payload: newUsers })
                        setLoading(false)
                    }
                    catch (err) {
                        console.error('error loading users:', err.message)
                        history.push('/error')
                    }
                }
            }
        )()
    }, [dispatch, history, state.accessToken, state.listening])

    const usersClasses = [classes.Users]
    if (props.show)
        usersClasses.push(classes.Open)

    let spinner = null
    if (loading)
        spinner = <Spinner />

    return (
        <div className={usersClasses.join(' ')}>
            <UsersHeader />
            <ul className={classes.Users__list}>
                {spinner}
                {state.users.map(user =>
                    < User
                        key={user.id}
                        name={user.name}
                        avatar={user.avatar}
                    />
                )}
            </ul>
        </div>
    )
}

export default Users;
