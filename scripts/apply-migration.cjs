// Script para verificar e aplicar migração
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://eczdeoijgompeseffexm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjemRlb2lqZ29tcGVzZWZmZXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzE5MDgsImV4cCI6MjA3MTA0NzkwOH0.z-egwTdrppB1MuCzTxJLTZs7yV6GyYglbIm724Ht-RI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMigration() {
  try {
    console.log('🔍 Verificando se a migração é necessária...');
    
    // Tentar fazer uma consulta que usa account_id para verificar se a coluna existe
    const { data, error } = await supabase
      .from('financial_goals')
      .select('id, account_id')
      .limit(1);
    
    if (error) {
      if (error.message && error.message.includes('account_id')) {
        console.log('❌ A coluna account_id não existe na tabela financial_goals.');
        console.log('\n📋 MIGRAÇÃO NECESSÁRIA');
        console.log('\n⚠️  Para corrigir o erro, execute os seguintes comandos SQL no painel do Supabase:');
        console.log('\n--- COMANDOS SQL PARA EXECUTAR ---');
        console.log('\n-- 1. Adicionar coluna account_id');
        console.log('ALTER TABLE financial_goals ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;');
        console.log('\n-- 2. Criar índices para performance');
        console.log('CREATE INDEX idx_financial_goals_account_id ON financial_goals(account_id);');
        console.log('CREATE INDEX idx_financial_goals_account_date ON financial_goals(account_id, created_at DESC);');
        console.log('\n-- 3. Migrar dados existentes para conta padrão');
        console.log(`UPDATE financial_goals 
SET account_id = (
    SELECT a.id 
    FROM accounts a 
    WHERE a.user_id = financial_goals.user_id 
    AND a.is_default = true
    LIMIT 1
)
WHERE account_id IS NULL;`);
        console.log('\n-- 4. Tornar account_id obrigatório');
        console.log('ALTER TABLE financial_goals ALTER COLUMN account_id SET NOT NULL;');
        console.log('\n-- 5. Atualizar políticas RLS');
        console.log('DROP POLICY IF EXISTS "Users can manage own goals" ON financial_goals;');
        console.log(`\nCREATE POLICY "Users can view own goals" ON financial_goals
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );`);
        console.log(`\nCREATE POLICY "Users can insert own goals" ON financial_goals
    FOR INSERT WITH CHECK (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );`);
        console.log(`\nCREATE POLICY "Users can update own goals" ON financial_goals
    FOR UPDATE USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );`);
        console.log(`\nCREATE POLICY "Users can delete own goals" ON financial_goals
    FOR DELETE USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );`);
        console.log('\n--- FIM DOS COMANDOS SQL ---\n');
        console.log('📋 INSTRUÇÕES:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/eczdeoijgompeseffexm');
        console.log('2. Clique em "SQL Editor" no menu lateral');
        console.log('3. Cole e execute os comandos SQL acima (um por vez)');
        console.log('4. Após executar todos os comandos, teste novamente o carregamento de metas');
        console.log('\n✨ Após a migração, o sistema de metas funcionará corretamente com múltiplas contas!');
      } else {
        console.error('❌ Erro inesperado:', error);
      }
    } else {
      console.log('✅ A coluna account_id já existe na tabela financial_goals.');
      console.log('✅ Migração não é necessária. O sistema deve funcionar corretamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar migração:', error);
  }
}

checkMigration();