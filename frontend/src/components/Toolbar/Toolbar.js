import React from 'react'

import Sidebar from '../Sidebar/Sidebar.js'

const Toolbar = props => {
    return (
        <div className="toolbar">
            <button className="sidebar-btn">Sidebar</button>
            <Sidebar />
            <h1>Channel name</h1>
            <button className="settings-btn">Settings</button>
        </div>
    )
}

export default Toolbar