import React, { useContext } from 'react'

import classes from './SettingsBar.module.css'

// context
import { StoreContext } from '../../context/Store'

// components
import Settings from '../../containers/Settings/Settings.js'

const SettingsBar = props => {
    const { state } = useContext(StoreContext)

    return (
        <div className={classes.SettingsBar}>
            <div className={classes.User}>
                <img className={classes.User_icon} src={require('../../assets/user-icon.svg')} alt="logged-in-user-icon" />
                <div className={classes.User_name}>{state.username}</div>
            </div>
            <Settings />
        </div>
    )
}

export default SettingsBar