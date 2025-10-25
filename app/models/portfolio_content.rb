# frozen_string_literal: true

require 'yaml'

class PortfolioContent
  class << self
    def home
      load_yaml(:home)
    end

    def about
      load_yaml(:about)
    end

    private

    def load_yaml(name)
      path = Rails.root.join('config', 'portfolio', "#{name}.yml")
      YAML.load_file(path).deep_symbolize_keys
    end
  end
end
