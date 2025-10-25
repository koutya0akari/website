import { Controller } from '@hotwired/stimulus'

// Rotates hero highlights to keep the section dynamic.
export default class extends Controller {
  static targets = ['list', 'item']
  static values = {
    interval: { type: Number, default: 6000 }
  }

  connect() {
    this.index = 0
    this.cycle = this.cycle.bind(this)
     this.element.classList.add('is-enhanced')
    if (this.itemTargets.length === 0) return

    this.activateCurrent()
    this.start()
  }

  disconnect() {
    this.stop()
    this.element.classList.remove('is-enhanced')
  }

  start() {
    if (this.itemTargets.length <= 1) return
    this.stop()
    this.timer = setInterval(this.cycle, this.intervalValue)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  cycle() {
    this.index = (this.index + 1) % this.itemTargets.length
    this.activateCurrent()
  }

  activateCurrent() {
    this.itemTargets.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === this.index)
      item.setAttribute('aria-hidden', idx === this.index ? 'false' : 'true')
    })
  }
};
