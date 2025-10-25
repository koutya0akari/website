# frozen_string_literal: true

require 'fileutils'

namespace :static do
  desc 'Export static HTML and assets into docs/ for GitHub Pages hosting'
  task export: :environment do
    output_dir = Rails.root.join('docs')

    FileUtils.rm_rf(output_dir)
    FileUtils.mkdir_p(output_dir)

    pages = {
      'index.html' => 'pages/home',
      'research/index.html' => 'pages/research',
      'teaching/index.html' => 'pages/teaching',
      'talks/index.html' => 'pages/talks',
      'publications/index.html' => 'pages/publications',
      'contact/index.html' => 'pages/contact'
    }

    pages.each do |filename, template|
      html = ApplicationController.render(
        template: template,
        layout: 'application'
      )

      destination = output_dir.join(filename)
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
