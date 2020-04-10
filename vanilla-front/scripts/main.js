const channels = document.querySelector('.channels-container')
const mobileNavButton = document.querySelector('.mobile-nav-button')
const users = document.querySelector('.users-container')

const toggleMobileNav = () => {
  channels.classList.toggle('show')
  users.classList.toggle('show')
}

mobileNavButton.addEventListener('click', toggleMobileNav)
