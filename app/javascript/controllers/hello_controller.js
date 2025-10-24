import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.element.textContent = 'ようこそ、数学の世界へ。'
  }
}
