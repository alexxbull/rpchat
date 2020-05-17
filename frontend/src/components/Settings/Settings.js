import React, { useState } from 'react'

import SettingsMenu from './SettingsMenu/SettingsMenu.js'

const Settings = props => {
    const [showSettingsMenu, setshowSettingsMenu] = useState(false)

    const settingsMenu = showSettingsMenu ? <SettingsMenu /> : null

    return (
        <div className="settings">
            <button
                className="settings-btn"
                onClick={setshowSettingsMenu.bind(this, !showSettingsMenu)}
            >Settings</button>
            {settingsMenu}
        </div>
    )
}

export default Settings