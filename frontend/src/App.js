import React, { useState, useEffect } from 'react';

import Backdrop from './components/Backdrop/Backdrop.js'
import Toolbar from './containers/Toolbar/Toolbar.js'
import Chat from './containers/Chat/Chat.js';

const rem = 16

function App() {
  const [isDesktop, setDesktop] = useState(window.innerWidth > 40 * rem) // +641px = desktop
  const updateView = () => setDesktop(window.innerWidth > 40 * rem)

  useEffect(() => {
    window.addEventListener('resize', updateView)
    return () => window.removeEventListener('resize', updateView)
  })

  const toolbar = isDesktop ? null : <Toolbar />

  return (
    <div className="App">
      <Backdrop />
      {toolbar}
      <Chat />
    </div>
  );
}

export default App;
