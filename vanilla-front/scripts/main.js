// load the page to the bottom of the chat messages
const messages = document.querySelector('.messages')
messages.scrollTo({ left: 0, top: messages.scrollHeight, behavior: "smooth" })


// mobile: on backdrop click hide users, channels, and backdrop
const backdrop = document.querySelector('.backdrop')

backdrop.addEventListener('click', () => {
  if (backdrop.style['display'] === 'block') {
    backdrop.style['display'] = 'none'
    channelsContainer.style['transform'] = 'translateX(-100%)'
    usersContainer.style['transform'] = 'translateX(100%)'
  }
}
)

// mobile: show channels when clicking the channels button and hide users
const channelsButton = document.querySelector('.chat-channels-button')
const channelsContainer = document.querySelector('.channels-container')

channelsButton.addEventListener('click', () => {
  if (channelsContainer.style['display'] !== 'block') {
    backdrop.style['display'] = 'block'
    channelsContainer.style['transform'] = 'translateX(0%)'
  }
}
)

// mobile: show users when clicking the users button and hide channels
const usersButton = document.querySelector('.chat-users-button')
const usersContainer = document.querySelector('.users-container')

usersButton.addEventListener('click', () => {
  if (usersContainer.style['display'] !== 'block') {
    backdrop.style['display'] = 'block'
    usersContainer.style['transform'] = 'translateX(0%)'
  }
}
)

// desktop: show channels's tooltip when hovering over add channel's icon
const createChannelIcon = document.querySelector('.channels-header .add-icon')
const createChannelTooltip = document.querySelector('.channels-header .add-icon ~ .tooltip')

createChannelIcon.addEventListener('mouseenter', (event) => {
  if (window.outerWidth >= 16 * 40) {
    Object.assign(createChannelTooltip.style, {
      top: 0,
      left: createChannelIcon.offsetLeft - createChannelTooltip.offsetWidth / 2.31 + 'px',
      visibility: 'visible',
      opacity: 1.
    })
  }
})

createChannelIcon.addEventListener('mouseleave', (event) => {
  Object.assign(createChannelTooltip.style, {
    visibility: 'hidden',
    opacity: 0,
  })
})