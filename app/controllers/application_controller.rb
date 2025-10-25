# frozen_string_literal: true

class ApplicationController < ActionController::Base
  helper_method :static_export?

  private

  def static_export?
    ENV['STATIC_EXPORT'] == 'true'
  end
end
