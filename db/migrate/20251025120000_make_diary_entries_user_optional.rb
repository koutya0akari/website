# frozen_string_literal: true

class MakeDiaryEntriesUserOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :diary_entries, :user_id, true
  end
end
