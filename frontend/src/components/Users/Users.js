import React, { useEffect, useState } from 'react';

import classes from './Users.module.css';

// grpc
import { ChatClient } from '../../client/grpc_clients.js';
import { EmptyMessage } from '../../proto/chat/chat_pb.js'

// components
import User from './User/User.js'
import UsersHeader from './UsersHeader/UsersHeader';
import Spinner from '../Spinner/Spinner';

const Users = props => {
    const [users, setUsers] = useState({ list: [], loading: true })

    const getUsers = async () => {
        // load users
        try {
            const req = new EmptyMessage()
            const res = await ChatClient.getUsers(req, {})
            const newUsers = { list: [], loading: false }
            newUsers.list = res.getUsersList().map(user =>
                < User
                    key={user.getId()}
                    name={user.getName()}
                    avatar={`${user.getAvatar()}`}
                />
            )
            setUsers(newUsers)
        }
        catch (err) {
            console.log('error loading users:', err)
            // send to 404 page
        }
    }

    // load user on initial render only
    useEffect(() => {
        getUsers()
    }, [])

    const usersClasses = [classes.Users]
    if (props.show) {
        usersClasses.push(classes.Open)
    }

    let spinner = null
    if (users.loading) {
        spinner = <Spinner />
    }

    return (
        <div className={usersClasses.join(' ')}>
            <UsersHeader />
            <ul className={classes.Users__list}>
                {spinner}
                {users.list}
            </ul>
        </div>
    )
}

export default Users;
