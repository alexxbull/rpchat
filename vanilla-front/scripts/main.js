const backdrop = document.querySelector('.backdrop')
const navBarMenu = document.querySelector('.nav-bar-menu')
const navBarButton = document.querySelector('.nav-bar-button')

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