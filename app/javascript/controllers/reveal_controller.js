import { Controller } from '@hotwired/stimulus'

// Adds a reveal animation when elements enter the viewport.
export default class extends Controller {
  static targets = ['item', 'container']
  static values = {
    threshold: { type: Number, default: 0.15 }
  }

  connect() {
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      threshold: this.thresholdValue
    })

    if (this.itemTargets.length > 0) {
      this.itemTargets.forEach((target) => this.prepare(target))
    } else {
      this.prepare(this.element)
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  prepare(target) {
    target.classList.add('will-reveal')
    this.observer.observe(target)
  }

  handleIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        entry.target.classList.remove('will-reveal')
        this.observer.unobserve(entry.target)
      }
    })
  }
}
