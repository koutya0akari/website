# frozen_string_literal: true

require 'digest'

class DiaryEntriesController < ApplicationController
  before_action :set_entry, only: :destroy

  def create
    @entry = DiaryEntry.new(entry_params)
    @entry.post_password = submitted_password

    unless valid_post_password?
      prepare_diary_context
      flash.now[:alert] = '投稿パスワードが正しくありません。'
      @entry.errors.add(:post_password, 'が正しくありません。')
      render 'pages/diary', status: :unprocessable_entity
      return
    end

    if @entry.save
      redirect_to diary_path, notice: '日記を保存しました。'
    else
      prepare_diary_context
      flash.now[:alert] = '日記を保存できませんでした。'
      render 'pages/diary', status: :unprocessable_entity
    end
  end

  def destroy
    unless valid_post_password?
      redirect_to diary_path, alert: '投稿パスワードが正しくありません。'
      return
    end

    @entry.destroy
    redirect_to diary_path, notice: '日記を削除しました。', status: :see_other
  end

  private

  def entry_params
    params.require(:diary_entry).permit(:title, :entry_date, :body)
  end

  def set_entry
    @entry = DiaryEntry.find(params[:id])
  end

  def prepare_diary_context
    @content = PortfolioContent.diary
    @site = @content[:site]
    @entries = DiaryEntry.includes(:user).sorted
    @entry.entry_date ||= Date.current
    @entry.post_password = nil if @entry.respond_to?(:post_password=)
  end

  def submitted_password
    params.dig(:diary_entry, :post_password).to_s
  end

  def valid_post_password?
    return true if static_export?

    expected = diary_post_password
    return true if expected.blank?

    provided_digest = ::Digest::SHA256.hexdigest(submitted_password)
    expected_digest = ::Digest::SHA256.hexdigest(expected)

    ActiveSupport::SecurityUtils.secure_compare(provided_digest, expected_digest)
  rescue ArgumentError
    false
  end

  def diary_post_password
    credentials_password =
      if Rails.application.respond_to?(:credentials)
        Rails.application.credentials.dig(:diary, :post_password)
      end

    credentials_password = credentials_password.presence
    env_password = ENV.fetch('DIARY_POST_PASSWORD', nil).presence

    credentials_password || env_password
  end
end
