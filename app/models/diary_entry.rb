class DiaryEntry < ApplicationRecord
  belongs_to :user, optional: true

  attr_accessor :post_password

  validates :body, presence: true
  validates :entry_date, presence: true

  scope :sorted, -> { order(entry_date: :desc, created_at: :desc) }

  before_validation :set_default_entry_date

  private

  def set_default_entry_date
    self.entry_date ||= Date.current
  end
end
