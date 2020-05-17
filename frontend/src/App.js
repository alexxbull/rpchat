import React from 'react';

import Backdrop from './components/Backdrop/Backdrop.js'
import Toolbar from './containers/Toolbar/Toolbar.js'
import Chat from './containers/Chat/Chat.js';

function App() {
  return (
    <div className="App">
      <Backdrop />
      <Toolbar />
      <Chat />
    </div>
  );
}

export default App;
