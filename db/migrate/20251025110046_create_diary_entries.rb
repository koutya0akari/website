class CreateDiaryEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :diary_entries do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.date :entry_date
      t.text :body

      t.timestamps
    end
  end
end
