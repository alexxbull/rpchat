import React, { useState, useContext, useEffect } from 'react'

import classes from '../SettingsBar.module.css'

import BackdropContext from '../../../context/BackdropContext'

const Settings = props => {
    const backdropContext = useContext(BackdropContext)
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)

    useEffect(() => {
        if (!backdropContext)
            setShowSettingsMenu(false)
    }, [backdropContext])

    let settingsMenu = null
    if (showSettingsMenu) {
        settingsMenu =
            <div className={classes.Settings_menu}>
                <button className={classes.Settings_menu_item}>About</button>
                <button className={classes.Settings_menu_item}>Sign Out</button>
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