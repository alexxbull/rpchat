import React from 'react'

import classes from './SettingsBar.module.css'

import Settings from '../../containers/Settings/Settings.js'

const SettingsBar = props => {
    return (
        <div className={classes.SettingsBar}>
            <div className={classes.User}>
                <img className={classes.User_icon} src={require('../../assets/user-icon.svg')} alt="logged-in-user-icon" />
                <div className={classes.User_name}>User Name</div>
            </div>
            <Settings />
        </div>
    )
}

export default SettingsBar