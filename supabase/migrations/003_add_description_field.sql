-- Rename current description field to title and add new optional description field
ALTER TABLE transactions RENAME COLUMN description TO title;
ALTER TABLE transactions ADD COLUMN description TEXT;

-- Add comments to the columns
COMMENT ON COLUMN transactions.title IS 'Transaction title (required)';
COMMENT ON COLUMN transactions.description IS 'Optional detailed description for the transaction';

-- Create index for better performance on description searches
CREATE INDEX IF NOT EXISTS idx_transactions_description ON transactions USING gin(to_tsvector('portuguese', description)) WHERE description IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_title ON transactions USING gin(to_tsvector('portuguese', title));