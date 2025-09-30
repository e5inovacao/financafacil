-- Criar tabela de limites por categoria
CREATE TABLE category_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL CHECK (limit_amount > 0),
    alert_percentage INTEGER DEFAULT 90 CHECK (alert_percentage BETWEEN 1 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar limites duplicados por categoria/conta
    UNIQUE(user_id, account_id, category)
);

-- Criar índices para performance
CREATE INDEX idx_category_limits_user_id ON category_limits(user_id);
CREATE INDEX idx_category_limits_account_id ON category_limits(account_id);
CREATE INDEX idx_category_limits_category ON category_limits(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_category_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_limits_updated_at
    BEFORE UPDATE ON category_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_category_limits_updated_at();

-- Permissões RLS (Row Level Security)
ALTER TABLE category_limits ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Users can manage their own category limits" ON category_limits
    FOR ALL USING (auth.uid() = user_id);

-- Permissões para roles
GRANT SELECT ON category_limits TO anon;
GRANT ALL PRIVILEGES ON category_limits TO authenticated;

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