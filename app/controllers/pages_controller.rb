# frozen_string_literal: true

class PagesController < ApplicationController
  def home
    @content = PortfolioContent.home
    @site = @content[:site]
  end

  def about
    @content = PortfolioContent.about
    @site = @content[:site]
  end

  def diary
    @content = PortfolioContent.diary
    @site = @content[:site]
    @entry = DiaryEntry.new(entry_date: Date.current)
    @entries = DiaryEntry.includes(:user).sorted
  end

  def research; end

  def teaching; end

  def talks; end

  def publications; end

  def contact; end
end
