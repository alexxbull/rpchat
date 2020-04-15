// load the page to the bottom of the chat messages
const messages = document.querySelector('.messages')
messages.scrollTo({ left: 0, top: messages.scrollHeight, behavior: "smooth" })

// mobile: toggle backdrop and nav menu via clicking the nav button
const backdrop = document.querySelector('.backdrop')
const navBarButton = document.querySelector('.chat-nav-button')
const navBarMenu = document.querySelector('.chat-nav')
const toggleNavBarMenu = () => {
  if (backdrop.style['display'] === 'block') {
    backdrop.style['display'] = 'none'
    navBarMenu.style['display'] = 'none'
  } else {
    backdrop.style['display'] = 'block'
    navBarMenu.style['display'] = 'flex'
  }
}

navBarButton.addEventListener('click', toggleNavBarMenu)
backdrop.addEventListener('click', toggleNavBarMenu)