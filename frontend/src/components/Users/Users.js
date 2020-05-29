import React from 'react';

import classes from './Users.module.css';

import User from './User/User.js'
import UsersHeader from './UsersHeader/UsersHeader';

import UserIcon from '../../assets/user-icon.svg'

const Users = props => {
    const usersData = [
        { name: "User1", id: 1, avatar: UserIcon, },
        { name: "User2", id: 2, avatar: UserIcon, },
        { name: "User3", id: 3, avatar: UserIcon, },
    ]


    let attachedClasses = [classes.Users, classes.Close]

    let users = null
    if (props.show) {
        users = usersData.map(user =>
            <User
                key={user.id}
                name={user.name}
                avatar={user.avatar}
            />
        )
        attachedClasses = [classes.Users, classes.Open]
    }

    return (
        <div className={attachedClasses.join(' ')}>
            <UsersHeader />
            <ul className={classes.Users__list}>
                {users}
            </ul>
        </div>
    )
}

export default Users;
