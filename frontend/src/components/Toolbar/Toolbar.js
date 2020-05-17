import React from 'react'

const Toolbar = props => {
    return (
        <div className="toolbar">
            <button className="sidebar-btn">Sidebar</button>
            <h1>Channel name</h1>
            <button className="settings-btn">Settings</button>
        </div>
    )
}

export default Toolbar