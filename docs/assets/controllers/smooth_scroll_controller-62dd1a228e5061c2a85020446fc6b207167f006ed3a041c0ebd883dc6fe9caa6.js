import { Controller } from '@hotwired/stimulus'

// Smoothly scrolls to in-page anchors when navigation links are clicked.
export default class extends Controller {
  scroll(event) {
    const rawHref = event.currentTarget.getAttribute('href') || ''
    if (!rawHref.includes('#')) return

    const resolvedUrl = new URL(rawHref, window.location.href)
    const hash = resolvedUrl.hash.replace('#', '')
    if (!hash) return

    const normalise = (path) => path.replace(/\/index\.html$/, '/').replace(/\/$/, '')
    const currentPath = normalise(window.location.pathname)
    const targetPath = normalise(resolvedUrl.pathname)

    if (targetPath !== currentPath) return

    event.preventDefault()
    const target = document.getElementById(hash)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${hash}`)
    }
  }
};
