require 'digest'
require 'securerandom'

class User < ApplicationRecord
  has_many :diary_entries, dependent: :destroy

  attr_reader :password

  before_validation :normalize_email

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 8 }, allow_nil: true
  validate :password_presence, on: :create

  def password=(raw_password)
    @password = raw_password
    return if raw_password.blank?

    self.password_salt = SecureRandom.hex(16)
    self.password_hash = digest(raw_password)
  end

  def authenticate(raw_password)
    return false if raw_password.blank? || password_hash.blank? || password_salt.blank?

    ActiveSupport::SecurityUtils.secure_compare(password_hash, digest(raw_password))
  end

  private

  def password_presence
    errors.add(:password, :blank) if password_hash.blank?
  end

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end

  def digest(raw_password)
    Digest::SHA256.hexdigest("#{password_salt}--#{raw_password}")
  end
end
