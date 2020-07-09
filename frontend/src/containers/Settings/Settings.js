import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import classes from './Settings.module.css'

const Settings = props => {
    const history = useHistory()
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)

    const handleLogout = () => {
        window.accessToken = null
        window.username = null
        history.push('/')
    }

    let settingsMenu = null
    if (showSettingsMenu) {
        settingsMenu =
            <div className={classes.Settings_menu}>
                <button className={classes.Settings_menu_item}>About</button>
                <button className={classes.Settings_menu_item} onClick={handleLogout}>Log Out</button>
            </div>
    }

    return (
        <div className={classes.Settings}>
            <button
                className={classes.Settings_btn}
                onClick={setShowSettingsMenu.bind(this, !showSettingsMenu)}>
            </button>
            {settingsMenu}
        </div>
    )
}

export default Settings