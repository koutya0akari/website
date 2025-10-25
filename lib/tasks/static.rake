# frozen_string_literal: true

require 'fileutils'

namespace :static do
  desc 'Export static HTML and assets into docs/ for GitHub Pages hosting'
  task export: :environment do
    output_dir = Rails.root.join('docs')

    FileUtils.rm_rf(output_dir)
    FileUtils.mkdir_p(output_dir)

    pages = [
      {
        filename: 'index.html',
        template: 'pages/home',
        assigns: -> {
          content = PortfolioContent.home
          { content: content, site: content[:site] }
        }
      },
      {
        filename: 'about/index.html',
        template: 'pages/about',
        assigns: -> {
          content = PortfolioContent.about
          { content: content, site: content[:site] }
        }
      }
    ]

    pages.each do |page|
      assigns = page[:assigns].call
      html = ApplicationController.render(
        template: page[:template],
        layout: 'application',
        assigns: assigns
      )

      destination = output_dir.join(page[:filename])
      FileUtils.mkdir_p(destination.dirname)
      File.write(destination, html)
    end

    precompile_task = Rake::Task['assets:precompile']
    clobber_task = Rake::Task['assets:clobber']

    precompile_task.reenable
    clobber_task.reenable

    precompile_task.invoke

    assets_source = Rails.root.join('public/assets')
    assets_target = output_dir.join('assets')

    if File.directory?(assets_source)
      FileUtils.mkdir_p(assets_target)
      FileUtils.cp_r("#{assets_source}/.", assets_target)
    end
  ensure
    if defined?(clobber_task) && clobber_task
      clobber_task.reenable
      clobber_task.invoke
    end
  end
end
