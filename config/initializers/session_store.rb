# frozen_string_literal: true

Rails.application.config.session_store :cookie_store, key: '_math_website_session', secure: Rails.env.production?
