import { Controller } from '@hotwired/stimulus'

// Smoothly scrolls to in-page anchors when navigation links are clicked.
export default class extends Controller {
  scroll(event) {
    const href = event.currentTarget.getAttribute('href') || ''
    if (!href.includes('#')) return

    const [path, hash] = href.split('#')
    const currentPath = window.location.pathname

    if (path && path !== '' && path !== currentPath) return
    if (!hash) return

    event.preventDefault()
    const target = document.getElementById(hash)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${hash}`)
    }
  }
};
