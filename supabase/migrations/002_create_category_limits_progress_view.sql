-- View para calcular progresso dos limites
CREATE OR REPLACE VIEW category_limits_progress AS
SELECT 
    cl.id,
    cl.user_id,
    cl.account_id,
    cl.category,
    cl.limit_amount,
    cl.alert_percentage,
    COALESCE((
        SELECT SUM(ABS(t.amount))
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = cl.user_id
            AND t.account_id = cl.account_id
            AND c.name = cl.category
            AND t.type = 'saida'
            AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ), 0) as current_spent,
    CASE 
        WHEN cl.limit_amount > 0 THEN 
            ROUND((COALESCE((
                SELECT SUM(ABS(t.amount))
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = cl.user_id
                    AND t.account_id = cl.account_id
                    AND c.name = cl.category
                    AND t.type = 'saida'
                    AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            ), 0) / cl.limit_amount * 100), 2)
        ELSE 0 
    END as percentage,
    CASE 
        WHEN COALESCE((
            SELECT SUM(ABS(t.amount))
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = cl.user_id
                AND t.account_id = cl.account_id
                AND c.name = cl.category
                AND t.type = 'saida'
                AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) >= cl.limit_amount THEN 'exceeded'
        WHEN (COALESCE((
            SELECT SUM(ABS(t.amount))
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = cl.user_id
                AND t.account_id = cl.account_id
                AND c.name = cl.category
                AND t.type = 'saida'
                AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) / cl.limit_amount * 100) >= cl.alert_percentage THEN 'warning'
        ELSE 'safe'
    END as status,
    cl.created_at,
    cl.updated_at
FROM category_limits cl;

-- Permissões para a view
GRANT SELECT ON category_limits_progress TO authenticated;