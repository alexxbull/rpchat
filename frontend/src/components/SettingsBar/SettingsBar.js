import React, { useContext } from 'react'

import classes from './SettingsBar.module.css'

// context
import { StoreContext } from '../../context/Store'

// components
import Settings from '../../containers/Settings/Settings.js'

const SettingsBar = props => {
    const { state } = useContext(StoreContext)
    const { avatar, username } = state

    return (
        <div className={classes.SettingsBar}>
            <div className={classes.User}>
                <img className={classes.User_icon} src={avatar} alt={`${username} avatar`} />
                <div className={classes.User_name}>{username}</div>
            </div>
            <Settings />
        </div>
    )
}

export default SettingsBar