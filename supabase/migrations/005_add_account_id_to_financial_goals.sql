-- Adicionar account_id à tabela financial_goals
-- Esta migração adiciona suporte a múltiplas contas para metas financeiras

-- 1. Adicionar coluna account_id à tabela financial_goals
ALTER TABLE financial_goals ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

-- 2. Criar índice para performance
CREATE INDEX idx_financial_goals_account_id ON financial_goals(account_id);
CREATE INDEX idx_financial_goals_account_date ON financial_goals(account_id, created_at DESC);

-- 3. Migrar metas existentes para a conta padrão de cada usuário
UPDATE financial_goals 
SET account_id = (
    SELECT a.id 
    FROM accounts a 
    WHERE a.user_id = financial_goals.user_id 
    AND a.is_default = true
    LIMIT 1
)
WHERE account_id IS NULL;

-- 4. Tornar account_id obrigatório após a migração
ALTER TABLE financial_goals ALTER COLUMN account_id SET NOT NULL;

-- 5. Atualizar RLS policies para usar account_id
DROP POLICY IF EXISTS "Users can manage own goals" ON financial_goals;

CREATE POLICY "Users can view own goals" ON financial_goals
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own goals" ON financial_goals
    FOR INSERT WITH CHECK (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own goals" ON financial_goals
    FOR UPDATE USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own goals" ON financial_goals
    FOR DELETE USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

-- 6. Atualizar políticas de goal_contributions para usar account_id
DROP POLICY IF EXISTS "Users can manage contributions to own goals" ON goal_contributions;

CREATE POLICY "Users can manage contributions to own goals" ON goal_contributions 
    FOR ALL USING (
        goal_id IN (
            SELECT fg.id 
            FROM financial_goals fg 
            JOIN accounts a ON fg.account_id = a.id 
            WHERE a.user_id = auth.uid()
        )
    );

-- 7. Garantir permissões para as tabelas
GRANT ALL PRIVILEGES ON financial_goals TO authenticated;
GRANT ALL PRIVILEGES ON goal_contributions TO authenticated;