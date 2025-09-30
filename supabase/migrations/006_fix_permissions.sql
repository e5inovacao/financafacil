-- Verificar e corrigir permissões para as tabelas category_limits e view category_limits_progress

-- Garantir que RLS está habilitado na tabela category_limits
ALTER TABLE category_limits ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own category limits" ON category_limits;
DROP POLICY IF EXISTS "Users can insert their own category limits" ON category_limits;
DROP POLICY IF EXISTS "Users can update their own category limits" ON category_limits;
DROP POLICY IF EXISTS "Users can delete their own category limits" ON category_limits;

-- Criar políticas RLS para category_limits
CREATE POLICY "Users can view their own category limits" ON category_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category limits" ON category_limits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category limits" ON category_limits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category limits" ON category_limits
    FOR DELETE USING (auth.uid() = user_id);

-- Garantir permissões básicas para usuários autenticados e anônimos
GRANT SELECT, INSERT, UPDATE, DELETE ON category_limits TO authenticated;
GRANT SELECT ON category_limits TO anon;

-- Recriar a view category_limits_progress com permissões
DROP VIEW IF EXISTS category_limits_progress;

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

-- Conceder permissões para a view
GRANT SELECT ON category_limits_progress TO authenticated;
GRANT SELECT ON category_limits_progress TO anon;

-- Verificar permissões atuais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
    AND table_name IN ('category_limits', 'category_limits_progress')
ORDER BY table_name, grantee;