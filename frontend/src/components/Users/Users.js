import React from 'react';

import classes from './Users.module.css';

import User from './User/User.js'

const Users = props => {
    const usersData = [
        { name: "User1", id: 1, avatar: 'someImagePath1', },
        { name: "User2", id: 2, avatar: 'someImagePath2', },
        { name: "User3", id: 3, avatar: 'someImagePath3', },
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
            {users}
        </div>
    )
}

export default Users;
