-- Primeiro, criar categorias de teste se não existirem
INSERT INTO categories (name, color) 
SELECT 'Alimentação', '#ff6b6b'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Alimentação');

INSERT INTO categories (name, color) 
SELECT 'Transporte', '#4ecdc4'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transporte');

INSERT INTO categories (name, color) 
SELECT 'Entretenimento', '#45b7d1'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Entretenimento');

-- Criar subcategorias de teste se não existirem
INSERT INTO subcategories (category_id, name)
SELECT c.id, 'Supermercado'
FROM categories c 
WHERE c.name = 'Alimentação'
  AND NOT EXISTS (SELECT 1 FROM subcategories s WHERE s.name = 'Supermercado' AND s.category_id = c.id);

INSERT INTO subcategories (category_id, name)
SELECT c.id, 'Combustível'
FROM categories c 
WHERE c.name = 'Transporte'
  AND NOT EXISTS (SELECT 1 FROM subcategories s WHERE s.name = 'Combustível' AND s.category_id = c.id);

INSERT INTO subcategories (category_id, name)
SELECT c.id, 'Cinema'
FROM categories c 
WHERE c.name = 'Entretenimento'
  AND NOT EXISTS (SELECT 1 FROM subcategories s WHERE s.name = 'Cinema' AND s.category_id = c.id);

-- Inserir limites de teste para diferentes categorias
INSERT INTO category_limits (user_id, account_id, category, limit_amount, alert_percentage)
SELECT 
  auth.uid() as user_id,
  a.id as account_id,
  'Alimentação' as category,
  1000.00 as limit_amount,
  90 as alert_percentage
FROM accounts a
WHERE a.user_id = auth.uid()
LIMIT 1
ON CONFLICT (user_id, account_id, category) DO NOTHING;

INSERT INTO category_limits (user_id, account_id, category, limit_amount, alert_percentage)
SELECT 
  auth.uid() as user_id,
  a.id as account_id,
  'Transporte' as category,
  500.00 as limit_amount,
  85 as alert_percentage
FROM accounts a
WHERE a.user_id = auth.uid()
LIMIT 1
ON CONFLICT (user_id, account_id, category) DO NOTHING;

INSERT INTO category_limits (user_id, account_id, category, limit_amount, alert_percentage)
SELECT 
  auth.uid() as user_id,
  a.id as account_id,
  'Entretenimento' as category,
  300.00 as limit_amount,
  80 as alert_percentage
FROM accounts a
WHERE a.user_id = auth.uid()
LIMIT 1
ON CONFLICT (user_id, account_id, category) DO NOTHING;

-- Inserir algumas transações de teste para simular gastos próximos aos limites
INSERT INTO transactions (user_id, account_id, category_id, subcategory_id, amount, type, title, description, transaction_date)
SELECT 
  auth.uid() as user_id,
  a.id as account_id,
  c.id as category_id,
  s.id as subcategory_id,
  -950.00 as amount,  -- 95% do limite de 1000
  'saida' as type,
  'Compras do mês' as title,
  'Compras do mês - teste' as description,
  CURRENT_DATE as transaction_date
FROM accounts a, categories c, subcategories s
WHERE a.user_id = auth.uid()
  AND c.name = 'Alimentação'
  AND s.name = 'Supermercado'
  AND s.category_id = c.id
LIMIT 1;

INSERT INTO transactions (user_id, account_id, category_id, subcategory_id, amount, type, title, description, transaction_date)
SELECT 
  auth.uid() as user_id,
  a.id as account_id,
  c.id as category_id,
  s.id as subcategory_id,
  -450.00 as amount,  -- 90% do limite de 500
  'saida' as type,
  'Combustível' as title,
  'Combustível do mês - teste' as description,
  CURRENT_DATE as transaction_date
FROM accounts a, categories c, subcategories s
WHERE a.user_id = auth.uid()
  AND c.name = 'Transporte'
  AND s.name = 'Combustível'
  AND s.category_id = c.id
LIMIT 1;

-- Comentário: Estes dados de teste criarão notificações de alerta
-- pois os gastos estão próximos ou acima dos limites configurados