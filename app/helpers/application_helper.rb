# frozen_string_literal: true

module ApplicationHelper
  def page_title(title)
    base = t('math_website.title')
    title.present? ? "#{title} | #{base}" : base
  end

  def nav_link(name, path)
    classes = ['nav-link']
    classes << 'active' if current_page?(path)
    link_to t("math_website.navigation.#{name}"), path, class: classes.join(' ')
  end
end
