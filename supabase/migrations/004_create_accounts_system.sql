-- Sistema de Múltiplas Contas por Usuário
-- Migração para implementar tabela accounts e modificar estrutura existente

-- 1. Criar tabela accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_account_name UNIQUE(user_id, name)
);

-- 2. Índices para performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_default ON accounts(user_id, is_default) WHERE is_default = true;

-- 3. RLS (Row Level Security) para accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Função para validar limite de contas por usuário
CREATE OR REPLACE FUNCTION validate_account_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM accounts WHERE user_id = NEW.user_id) >= 10 THEN
        RAISE EXCEPTION 'Usuário não pode ter mais de 10 contas';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_account_limit
    BEFORE INSERT ON accounts
    FOR EACH ROW EXECUTE FUNCTION validate_account_limit();

-- 5. Trigger para garantir uma conta padrão por usuário
CREATE OR REPLACE FUNCTION ensure_single_default_account()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE accounts 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default
    BEFORE INSERT OR UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_account();

-- 6. Função para criar conta padrão ao registrar usuário
CREATE OR REPLACE FUNCTION create_default_account()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO accounts (user_id, name, is_default)
    VALUES (NEW.id, 'Conta Principal', true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para criar conta padrão automaticamente
CREATE TRIGGER trigger_create_default_account
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_account();

-- 8. Adicionar account_id às transações existentes
ALTER TABLE transactions ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

-- 9. Criar índice para performance em transactions
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date DESC);

-- 10. Nota: Categorias permanecem globais (sem account_id)
-- As categorias são compartilhadas entre todos os usuários e contas

-- 12. Migração para usuários existentes (criar conta padrão)
INSERT INTO accounts (user_id, name, is_default)
SELECT 
    id as user_id,
    'Conta Principal' as name,
    true as is_default
FROM auth.users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM accounts WHERE user_id IS NOT NULL);

-- 13. Atualizar transações existentes para conta padrão
UPDATE transactions 
SET account_id = (
    SELECT a.id 
    FROM accounts a 
    WHERE a.user_id = transactions.user_id 
    AND a.is_default = true
    LIMIT 1
)
WHERE account_id IS NULL;

-- 14. Nota: Categorias permanecem globais, não precisam de migração

-- 15. Atualizar RLS para transactions com account_id
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

-- 16. Nota: Categorias permanecem globais, mantendo RLS atual
-- As categorias são visíveis para todos os usuários autenticados

-- 17. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 18. Trigger para atualizar updated_at em accounts
CREATE TRIGGER trigger_update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();