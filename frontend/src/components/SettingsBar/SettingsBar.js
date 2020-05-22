import React from 'react'

import classes from './SettingsBar.module.css'
import Settings from './Settings/Settings'

const SettingsBar = props => {
    return (
        <div className={classes.SettingsBar}>
            <div className={classes.User}>
                <div className={classes.User_icon}></div>
                <div className={classes.User_name}>User Name</div>
            </div>
            <Settings />
        </div>
    )
}

export default SettingsBar