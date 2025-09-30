-- Verificar e recriar a view category_limits_progress
-- Drop da view se existir
DROP VIEW IF EXISTS category_limits_progress;

-- Criar a view category_limits_progress
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
    COALESCE(spent.total_spent, 0) as current_spent,
    CASE 
        WHEN cl.limit_amount > 0 THEN 
            ROUND((COALESCE(spent.total_spent, 0) / cl.limit_amount) * 100, 2)
        ELSE 0
    END as percentage_used,
    CASE 
        WHEN COALESCE(spent.total_spent, 0) >= cl.limit_amount THEN true
        ELSE false
    END as is_over_limit,
    CASE 
        WHEN cl.limit_amount > 0 AND 
             (COALESCE(spent.total_spent, 0) / cl.limit_amount) * 100 >= cl.alert_percentage 
        THEN true
        ELSE false
    END as should_alert
FROM category_limits cl
LEFT JOIN (
    SELECT 
        c.name as category_name,
        t.user_id,
        t.account_id,
        SUM(t.amount) as total_spent
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'saida'
        AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    GROUP BY c.name, t.user_id, t.account_id
) spent ON cl.category = spent.category_name 
    AND cl.user_id = spent.user_id 
    AND cl.account_id = spent.account_id;

-- Conceder permissões para usuários autenticados e anônimos
GRANT SELECT ON category_limits_progress TO authenticated;
GRANT SELECT ON category_limits_progress TO anon;

-- Verificar se a view foi criada
SELECT 'View category_limits_progress criada com sucesso' as status;