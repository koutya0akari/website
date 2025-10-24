# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'

Bundler.require(*Rails.groups)

module MathWebsite
  class Application < Rails::Application
    config.load_defaults 7.1

    config.time_zone = 'Tokyo'
    config.generators do |g|
      g.assets false
      g.helper false
      g.test_framework nil
    end
  end
end
