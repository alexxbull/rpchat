import React, { useState, useEffect } from 'react';

import Toolbar from './containers/Toolbar/Toolbar.js'
import Chat from './containers/Chat/Chat.js';
import Channels from './components/Channels/Channels.js';
import Users from './components/Users/Users.js';
import Backdrop from './components/Backdrop/Backdrop.js';

const rem = 16

function App() {
  const [isDesktop, setDesktop] = useState(window.innerWidth > 40 * rem) // +641px = desktop
  const updateView = () => setDesktop(window.innerWidth > 40 * rem)

  const [showChannels, setShowChannels] = useState(false)
  const [showUsers, setShowUsers] = useState(false)

  const toggleBackdrop = () => {
    showChannels ? setShowChannels(false) : setShowUsers(false)
  }

  useEffect(() => {
    window.addEventListener('resize', updateView)
    return () => window.removeEventListener('resize', updateView)
  })

  return (
    <div className="App">
      <Backdrop show={!isDesktop && (showChannels || showUsers)} click={toggleBackdrop} isDesktop={isDesktop} />
      <Toolbar
        show={!isDesktop}
        isDesktop={isDesktop}
        showChannels={setShowChannels.bind(this, true)}
        showUsers={setShowUsers.bind(this, true)}
      />
      <Channels show={isDesktop || showChannels} isDesktop={isDesktop} />
      <Chat />
      <Users show={isDesktop || showUsers} />
    </div>
  );
}

export default App;
