import React, { useContext, useEffect, useState } from 'react';

// grpc
import { AuthClient } from './client/grpc_clients.js'
import { EmptyMessage } from './proto/auth/auth_pb.js'

// context
import { StoreContext } from './context/Store.js';

// components
import Chat from './containers/Chat/Chat.js';
import Channels from './components/Channels/Channels.js';
import Users from './components/Users/Users.js';
import Backdrop from './components/Backdrop/Backdrop.js';
import { broadcastListener } from './components/BroadcastListener/BroadcastListener.js';
import RefreshHandlder from './components/RefreshHandler/RefreshHandler.js';

const rem = 16

const App = props => {
  const { dispatch, state } = useContext(StoreContext)
  const [isDesktop, setDesktop] = useState(window.innerWidth > 40 * rem) // +641px = desktop
  const updateView = () => setDesktop(window.innerWidth > 40 * rem)

  const [showChannels, setShowChannels] = useState(false)
  const [showUsers, setShowUsers] = useState(false)

  const toggleBackdrop = () => {
    showChannels ? setShowChannels(false) : setShowUsers(false)
  }

  // authenticate user
  const getAccessToken = async () => {
    try {
      const req = new EmptyMessage()
      const authClient = AuthClient(dispatch)
      await authClient.refresh(req, {})
    }
    catch (err) {
      props.history.push('/error')
    }
  }

  if (!window.accessToken) {
    getAccessToken()
  }

  // listen for broadcasted responses 
  useEffect(() => {
    if (!state.listening && window.accessToken)
      broadcastListener(state.username, dispatch)
  }, [state.listening, state.username, dispatch])

  // re-render on window resize
  useEffect(() => {
    window.addEventListener('resize', updateView)
    return () => window.removeEventListener('resize', updateView)
  })

  return (
    <div className="App">
      <RefreshHandlder />
      <Backdrop show={!isDesktop && (showChannels || showUsers)} click={toggleBackdrop} isDesktop={isDesktop} />
      <Channels show={isDesktop || showChannels} isDesktop={isDesktop} />
      <Chat
        isDesktop={isDesktop}
        showChannels={setShowChannels.bind(this, true)}
        showUsers={setShowUsers.bind(this, true)}
      />
      <Users show={isDesktop || showUsers} />
    </div>
  )
}

export default App