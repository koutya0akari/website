# frozen_string_literal: true

require 'fileutils'

namespace :static do
  desc 'Export static HTML and assets into docs/ for GitHub Pages hosting'
  task export: :environment do
    output_dir = Rails.root.join('docs')

    FileUtils.rm_rf(output_dir)
    FileUtils.mkdir_p(output_dir)

    ENV['STATIC_EXPORT'] = 'true'

    precompile_task = Rake::Task['assets:precompile']
    clobber_task = Rake::Task['assets:clobber']

    precompile_task.reenable
    clobber_task.reenable

    precompile_task.invoke

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
      },
      {
        filename: 'login/index.html',
        template: 'sessions/new',
        assigns: -> {
          site = PortfolioContent.home[:site]
          {
            content: {
              page_title: 'ログイン',
              meta_description: 'Akari Math Lab の学習日記にログインします。'
            },
            site: site
          }
        }
      },
      {
        filename: 'diary/index.html',
        template: 'pages/diary',
        assigns: -> {
          content = PortfolioContent.diary
          {
            content: content,
            site: content[:site],
            entry: DiaryEntry.new(entry_date: Date.current),
            entries: DiaryEntry.includes(:user).sorted
          }
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

      depth = depth_for(page[:filename])
      destination = output_dir.join(page[:filename])
      FileUtils.mkdir_p(destination.dirname)
      File.write(destination, rewrite_static_paths(html, depth))
    end

    assets_source = Rails.root.join('public/assets')
    assets_target = output_dir.join('assets')

    if File.directory?(assets_source)
      FileUtils.mkdir_p(assets_target)
      FileUtils.cp_r("#{assets_source}/.", assets_target)
    end
  ensure
    ENV.delete('STATIC_EXPORT')

    if defined?(clobber_task) && clobber_task
      clobber_task.reenable
      clobber_task.invoke
    end
  end
end

def depth_for(filename)
  dirname = File.dirname(filename)
  return 0 if dirname == '.'

  dirname.split('/').size
end

def rewrite_static_paths(html, depth)
  processed = html.dup
  prefix = '../' * depth

  processed.gsub!('href="/"', %(href="#{prefix}index.html"))
  processed.gsub!(/href="\/#([^"]+)"/) { %(href="#{prefix}index.html##{$1}") }

  processed.gsub!(/href="\/([^"#?]*)(#[^"]*)?"/) do
    path = Regexp.last_match(1)
    anchor = Regexp.last_match(2).to_s

    if path.nil? || path.empty?
      %(href="#{prefix}index.html#{anchor}")
    elsif path.include?('.')
      %(href="#{prefix}#{path}#{anchor}")
    elsif path.start_with?('assets')
      %(href="#{prefix}#{path}#{anchor}")
    else
      %(href="#{prefix}#{path}/index.html#{anchor}")
    end
  end

  processed.gsub!(/(href|src)="\/assets\//) { %(#{Regexp.last_match(1)}="#{prefix}assets/) }
  processed.gsub!('"/assets/', %("#{prefix}assets/))

  processed
end
