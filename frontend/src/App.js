import React, { useState, useEffect } from 'react';

import Toolbar from './containers/Toolbar/Toolbar.js'
import Chat from './containers/Chat/Chat.js';
import Channels from './components/Channels/Channels.js';
import Users from './components/Users/Users.js';

const rem = 16

function App() {
  const [isDesktop, setDesktop] = useState(window.innerWidth > 40 * rem) // +641px = desktop
  const updateView = () => setDesktop(window.innerWidth > 40 * rem)

  useEffect(() => {
    window.addEventListener('resize', updateView)
    return () => window.removeEventListener('resize', updateView)
  })

  return (
    <div className="App">
      <Toolbar show={!isDesktop} />
      <Channels show={isDesktop} />
      <Chat />
      <Users show={isDesktop} />
    </div>
  );
}

export default App;
