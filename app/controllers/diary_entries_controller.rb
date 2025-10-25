# frozen_string_literal: true

class DiaryEntriesController < ApplicationController
  before_action :require_login
  before_action :set_entry, only: :destroy

  def create
    @entry = current_user.diary_entries.new(entry_params)

    if @entry.save
      redirect_to diary_path, notice: '日記を保存しました。'
    else
      prepare_diary_context
      flash.now[:alert] = '日記を保存できませんでした。'
      render 'pages/diary', status: :unprocessable_entity
    end
  end

  def destroy
    @entry.destroy
    redirect_to diary_path, notice: '日記を削除しました。', status: :see_other
  end

  private

  def entry_params
    params.require(:diary_entry).permit(:title, :entry_date, :body)
  end

  def set_entry
    @entry = current_user.diary_entries.find(params[:id])
  end

  def prepare_diary_context
    @content = PortfolioContent.diary
    @site = @content[:site]
    @entries = DiaryEntry.includes(:user).sorted
    @entry.entry_date ||= Date.current
  end
end
