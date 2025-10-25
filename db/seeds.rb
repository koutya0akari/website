# frozen_string_literal: true

puts 'Seed data is not required for the mathematician portfolio.'

admin_email = ENV['DIARY_ADMIN_EMAIL']
admin_password = ENV['DIARY_ADMIN_PASSWORD']

if admin_email.present? && admin_password.present?
  admin_name = ENV['DIARY_ADMIN_NAME'].presence || 'Diary Admin'
  user = User.find_or_initialize_by(email: admin_email.strip.downcase)
  user.name = admin_name
  user.password = admin_password

  if user.save
    puts "Diary user ensured for #{admin_email}"
  else
    warn "Failed to seed diary user: #{user.errors.full_messages.join(', ')}"
  end
else
  puts 'Set DIARY_ADMIN_EMAIL and DIARY_ADMIN_PASSWORD to seed a diary user.'
end
