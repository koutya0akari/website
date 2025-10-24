# frozen_string_literal: true

require 'active_support/core_ext/integer/time'

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = false

  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    'Cache-Control' => "public, max-age=3600"
  }

  config.active_support.deprecation = :stderr
  config.action_mailer.perform_caching = false
  config.action_view.annotate_rendered_view_with_filenames = true
end
