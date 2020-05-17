import React, { useState } from 'react'

import Sidebar from '../../components/Sidebar/Sidebar.js'
import Settings from '../Settings/Settings.js'

const Toolbar = props => {
    const [showSidebar, setShowSideBar] = useState(false)

    const sidebar = showSidebar ? <Sidebar /> : null

    return (
        <div className="toolbar">
            <button
                className="sidebar-btn"
                onClick={setShowSideBar.bind(this, !showSidebar)}
            >Sidebar</button>
            {sidebar}
            <h1>Channel name</h1>
            <Settings />
        </div>
    )
}

export default Toolbar