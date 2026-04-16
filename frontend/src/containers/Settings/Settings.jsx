import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// css
import classes from './Settings.module.css'

// grpc
import { create } from "@bufbuild/protobuf";
import { ChatClient } from '../../client/grpc_clients'
import { BroadcastRequestSchema } from '../../proto/chat/chat_pb.js'


// context
import { StoreContext } from '../../context/Store'

const Settings = props => {
    const { dispatch, state } = useContext(StoreContext)
    const navigate = useNavigate()
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)

    const handleLogout = async () => {
        try {
            const chatClient = ChatClient(dispatch)
            const req = create(BroadcastRequestSchema, {
                username: state.username,
            });
            await chatClient.closeBroadcast(req, {})
        }
        catch (err) {
            console.error('Logout issue:', err.message)
        }

        navigate('/')
        dispatch({ type: 'logout' })
    }

    let settingsMenu = null
    if (showSettingsMenu) {
        settingsMenu = (
            <div className={classes.Settings_menu}>
                <button className={classes.Settings_menu_item} onClick={() => navigate('/About')}>About</button>
                <button className={classes.Settings_menu_item} onClick={handleLogout}>Log Out</button>
            </div>
        )
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