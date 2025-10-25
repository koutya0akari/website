import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['form', 'titleField', 'dateField', 'bodyField']
  static values = {
    storageKey: String
  }

  connect() {
    if (!this.hasTitleFieldTarget || !this.storageKeyValue) return

    this.persistDraftHandler = this.persistDraft.bind(this)
    this.titleFieldTarget.addEventListener('input', this.persistDraftHandler)
    this.dateFieldTarget.addEventListener('input', this.persistDraftHandler)
    this.bodyFieldTarget.addEventListener('input', this.persistDraftHandler)

    this.loadDraft()

    if (!this.dateFieldTarget.value) {
      this.dateFieldTarget.value = this.currentDate()
    }
  }

  disconnect() {
    if (!this.persistDraftHandler) return

    this.titleFieldTarget?.removeEventListener('input', this.persistDraftHandler)
    this.dateFieldTarget?.removeEventListener('input', this.persistDraftHandler)
    this.bodyFieldTarget?.removeEventListener('input', this.persistDraftHandler)
  }

  clearDraft(event) {
    event?.preventDefault()
    if (!this.hasTitleFieldTarget) return

    this.titleFieldTarget.value = ''
    this.bodyFieldTarget.value = ''
    this.dateFieldTarget.value = this.currentDate()
    localStorage.removeItem(this.draftStorageKey())
  }

  handleSubmitEnd(event) {
    if (event.detail.success) {
      this.clearDraft()
    }
  }

  persistDraft() {
    const draft = {
      title: this.titleFieldTarget.value,
      date: this.dateFieldTarget.value,
      body: this.bodyFieldTarget.value
    }

    const allBlank = !draft.title.trim() && !draft.date.trim() && !draft.body.trim()
    if (allBlank) {
      localStorage.removeItem(this.draftStorageKey())
      return
    }

    localStorage.setItem(this.draftStorageKey(), JSON.stringify(draft))
  }

  loadDraft() {
    try {
      const stored = localStorage.getItem(this.draftStorageKey())
      if (!stored) return
      const draft = JSON.parse(stored)
      if (draft.title) this.titleFieldTarget.value = draft.title
      if (draft.date) this.dateFieldTarget.value = draft.date
      if (draft.body) this.bodyFieldTarget.value = draft.body
    } catch {
      // Ignore malformed draft data
    }
  }

  draftStorageKey() {
    return `${this.storageKeyValue}:draft`
  }

  currentDate() {
    return new Date().toISOString().slice(0, 10)
  }
};
