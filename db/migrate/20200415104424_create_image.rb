class CreateImage < ActiveRecord::Migration[5.2]
  def change
    create_table :images do |t|
      t.string :url, null:false
      t.references :item, null: false, foreign_key: true
      t.timestamps
    end
  end
end
