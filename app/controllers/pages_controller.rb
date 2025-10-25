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

  def research; end

  def teaching; end

  def talks; end

  def publications; end

  def contact; end
end
