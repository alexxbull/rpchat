import React, { useContext, useEffect, useState } from 'react';

// grpc
import { create } from "@bufbuild/protobuf";
import { AuthClient } from './client/grpc_clients'
import { EmptyMessageSchema } from './proto/auth/auth_pb.js'

// context
import { StoreContext } from './context/Store';

// components
import Chat from './containers/Chat/Chat.jsx';
import Channels from './components/Channels/Channels.jsx';
import Users from './components/Users/Users.jsx';
import Backdrop from './components/Backdrop/Backdrop.jsx';
import { broadcastListener } from './components/BroadcastListener/BroadcastListener.jsx';
import RefreshHandler from './components/RefreshHandler/RefreshHandler.jsx';

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
      const req = create(EmptyMessageSchema, {});
      const authClient = AuthClient(dispatch)
      await authClient.refresh(req, {})
    }
    catch (err) {
      console.error('unable to get access token', err.message)
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

  // reset channels/users sidebar when layout switches to desktop
  useEffect(() => {
    if (isDesktop) {
      setShowChannels(false)
      setShowUsers(false)
    }
  }, [isDesktop])

  return (
    <div className="App">
      <RefreshHandler />
      <Backdrop show={!isDesktop && (showChannels || showUsers)} click={toggleBackdrop} isDesktop={isDesktop} />
      <Channels show={isDesktop || showChannels} isDesktop={isDesktop} hideChannels={setShowChannels.bind(this, false)} />
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