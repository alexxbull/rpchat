import React from 'react'

import classes from './UsersHeader.module.css'

const UsersHeader = props => {
    return (
        <header className={classes.UsersHeader}>
            <div className={classes.UsersIcon}></div>
            <h1 className={classes.UsersHeader_title}>Users</h1>
        </header>
    )
}

export default UsersHeader