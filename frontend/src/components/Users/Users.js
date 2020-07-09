import React, { useContext, useEffect, useState } from 'react';

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
    const [loading, setLoading] = useState(true)

    // load user after initial render only
    useEffect(() => {
        (
            async () => {
                // load users
                try {
                    const req = new EmptyMessage()
                    const res = await ChatClient.getUsers(req, {})
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
                    console.log('error loading users:', err)
                    // send to 404 page
                }
            }
        )()
    }, [dispatch])

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
