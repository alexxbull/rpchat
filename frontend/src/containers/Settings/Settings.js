import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'

// css
import classes from './Settings.module.css'

// grpc
import { ChatClient } from '../../client/grpc_clients.js'
import { BroadcastRequest } from '../../proto/chat/chat_pb.js'

// context
import { StoreContext } from '../../context/Store.js'

const Settings = props => {
    const { dispatch, state } = useContext(StoreContext)
    const history = useHistory()
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)

    const handleLogout = async () => {
        try {
            const chatClient = ChatClient(dispatch)
            const req = new BroadcastRequest()
            req.setUsername(state.username)
            await chatClient.closeBroadcast(req, {})
        }
        catch (err) {
            console.error('Logout issue:', err.message)
        }

        history.push('/')
        dispatch({ type: 'logout' })
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