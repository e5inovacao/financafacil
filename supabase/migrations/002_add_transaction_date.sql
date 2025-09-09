-- Add transaction_date field to transactions table
ALTER TABLE transactions ADD COLUMN transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Update existing transactions to use created_at date as transaction_date
UPDATE transactions SET transaction_date = DATE(created_at);

-- Add index for better performance on date queries
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Add check constraint to prevent future dates
ALTER TABLE transactions ADD CONSTRAINT chk_transaction_date_not_future 
  CHECK (transaction_date <= CURRENT_DATE);