# frozen_string_literal: true

module ApplicationHelper
  def page_title(title, site = nil)
    base = site&.dig(:brand) || 'Akari Math Lab'
    title.present? ? "#{title} | #{base}" : base
  end

  def portfolio_action_href(action)
    return action[:href] if action[:href].present?

    helper_name = action[:path_helper]&.to_sym
    helper_name ? public_send(helper_name) : '#'
  end

  def portfolio_button_classes(style)
    variant = style == 'primary' ? 'btn-primary' : 'btn-outline'
    ['btn', variant].join(' ')
  end

  def portfolio_html(fragment)
    fragment.present? ? fragment.html_safe : ''.html_safe
  end
end
