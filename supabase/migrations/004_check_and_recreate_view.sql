-- Verificar se a view category_limits_progress existe e recriá-la se necessário
DROP VIEW IF EXISTS category_limits_progress;

-- Recriar a view category_limits_progress
CREATE VIEW category_limits_progress AS
SELECT 
  cl.id,
  cl.user_id,
  cl.account_id,
  cl.category,
  cl.limit_amount,
  cl.alert_percentage,
  cl.created_at,
  cl.updated_at,
  COALESCE(spent.current_spent, 0) as current_spent,
  CASE 
    WHEN cl.limit_amount > 0 THEN 
      ROUND((COALESCE(spent.current_spent, 0) / cl.limit_amount) * 100, 2)
    ELSE 0
  END as percentage,
  CASE 
    WHEN COALESCE(spent.current_spent, 0) >= cl.limit_amount THEN 'exceeded'
    WHEN (COALESCE(spent.current_spent, 0) / cl.limit_amount) * 100 >= cl.alert_percentage THEN 'warning'
    ELSE 'safe'
  END as status
FROM category_limits cl
LEFT JOIN (
  SELECT 
    t.user_id,
    t.account_id,
    c.name as category,
    ABS(SUM(t.amount)) as current_spent
  FROM transactions t
  JOIN categories c ON t.category_id = c.id
  WHERE t.type = 'saida'
    AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  GROUP BY t.user_id, t.account_id, c.name
) spent ON cl.user_id = spent.user_id 
         AND cl.account_id = spent.account_id 
         AND cl.category = spent.category;

-- Conceder permissões para usuários autenticados
GRANT SELECT ON category_limits_progress TO authenticated;
GRANT SELECT ON category_limits_progress TO anon;