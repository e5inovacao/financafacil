# Plano de Implementação - Sistema de Múltiplas Contas

## 1. Estratégia de Implementação Modular

### Fase 1: Infraestrutura de Dados (Semana 1-2)
**Objetivo:** Preparar estrutura de banco de dados e migrações

**Tarefas:**
- Criar tabela `accounts` com RLS
- Adicionar `account_id` às tabelas existentes
- Implementar triggers e funções de banco
- Executar migração para usuários existentes
- Testes de integridade de dados

**Critérios de Aceite:**
- ✅ Todos os usuários possuem conta padrão
- ✅ RLS funcionando corretamente
- ✅ Dados existentes migrados sem perda

### Fase 2: Backend e Context API (Semana 2-3)
**Objetivo:** Implementar lógica de negócio e gerenciamento de estado

**Tarefas:**
- Criar Context API para conta ativa
- Implementar hooks personalizados (useAccount, useAccounts)
- Adaptar queries existentes para incluir account_id
- Implementar CRUD de contas via Supabase
- Testes unitários dos hooks

**Critérios de Aceite:**
- ✅ Context mantém estado da conta ativa
- ✅ Queries filtram por conta corretamente
- ✅ CRUD de contas funcionando

### Fase 3: Interface de Usuário (Semana 3-4)
**Objetivo:** Desenvolver componentes de interface

**Tarefas:**
- Criar componente AccountDropdown
- Implementar modal CreateAccountModal
- Adaptar layout do header/navbar
- Implementar indicadores visuais de conta ativa
- Testes de componentes

**Critérios de Aceite:**
- ✅ Dropdown lista contas do usuário
- ✅ Modal cria novas contas
- ✅ Interface responsiva

### Fase 4: Integração e Testes (Semana 4-5)
**Objetivo:** Integrar todas as funcionalidades e testar

**Tarefas:**
- Integrar componentes com páginas existentes
- Implementar persistência de conta ativa
- Testes end-to-end
- Otimizações de performance
- Documentação técnica

**Critérios de Aceite:**
- ✅ Sistema funciona de ponta a ponta
- ✅ Performance adequada
- ✅ Sem regressões nas funcionalidades existentes

## 2. Estratégias de Segurança

### 2.1 Row Level Security (RLS)
```sql
-- Política base para isolamento de dados
CREATE POLICY "account_isolation" ON transactions
    FOR ALL USING (
        account_id IN (
            SELECT id FROM accounts 
            WHERE user_id = auth.uid()
        )
    );
```

### 2.2 Validações Frontend
```typescript
// Validação de propriedade de conta
const validateAccountOwnership = async (accountId: string) => {
  const { data: account } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single();
    
  if (!account) {
    throw new Error('Conta não encontrada ou acesso negado');
  }
};
```

### 2.3 Auditoria e Logs
- Implementar logs de criação/alteração de contas
- Monitorar tentativas de acesso não autorizado
- Alertas para comportamentos suspeitos

## 3. Estratégias de Performance

### 3.1 Otimizações de Banco de Dados
```sql
-- Índices estratégicos
CREATE INDEX CONCURRENTLY idx_transactions_account_date 
    ON transactions(account_id, transaction_date DESC);
    
CREATE INDEX CONCURRENTLY idx_categories_account_type 
    ON categories(account_id, type);
```

### 3.2 Cache e Estado Local
```typescript
// Context com cache de contas
const AccountContext = createContext({
  accounts: [],
  activeAccount: null,
  isLoading: false,
  // Cache por 5 minutos
  lastFetch: null,
  cacheTimeout: 5 * 60 * 1000
});
```

### 3.3 Lazy Loading
- Carregar dados da conta apenas quando selecionada
- Implementar skeleton loading para transições
- Prefetch de contas mais utilizadas

### 3.4 Otimizações de Query
```typescript
// Query otimizada com select específico
const getAccountTransactions = (accountId: string) => {
  return supabase
    .from('transactions')
    .select(`
      id,
      amount,
      description,
      transaction_date,
      categories(name, color)
    `)
    .eq('account_id', accountId)
    .order('transaction_date', { ascending: false })
    .limit(50);
};
```

## 4. Estrutura de Componentes

### 4.1 AccountProvider
```typescript
// Provider principal para gerenciamento de contas
interface AccountContextType {
  accounts: Account[];
  activeAccount: Account | null;
  setActiveAccount: (account: Account) => void;
  createAccount: (name: string) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

### 4.2 AccountDropdown
```typescript
// Componente dropdown para seleção de contas
interface AccountDropdownProps {
  className?: string;
  onAccountChange?: (account: Account) => void;
}
```

### 4.3 CreateAccountModal
```typescript
// Modal para criação de novas contas
interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (account: Account) => void;
}
```

## 5. Testes e Qualidade

### 5.1 Testes Unitários
```typescript
// Exemplo de teste para hook useAccount
describe('useAccount', () => {
  it('should switch active account', async () => {
    const { result } = renderHook(() => useAccount());
    
    await act(async () => {
      await result.current.setActiveAccount(mockAccount);
    });
    
    expect(result.current.activeAccount).toEqual(mockAccount);
  });
});
```

### 5.2 Testes de Integração
- Testar fluxo completo de criação de conta
- Verificar isolamento de dados entre contas
- Validar comportamento em cenários de erro

### 5.3 Testes de Performance
- Benchmark de queries com múltiplas contas
- Teste de carga com muitas contas por usuário
- Monitoramento de tempo de resposta

## 6. Monitoramento e Manutenção

### 6.1 Métricas Importantes
- Número médio de contas por usuário
- Tempo de resposta das queries por conta
- Taxa de erro na criação de contas
- Uso de memória do Context API

### 6.2 Alertas e Monitoramento
```typescript
// Exemplo de monitoramento de performance
const trackAccountSwitch = (fromAccount: string, toAccount: string) => {
  analytics.track('account_switched', {
    from_account_id: fromAccount,
    to_account_id: toAccount,
    timestamp: new Date().toISOString()
  });
};
```

### 6.3 Plano de Manutenção
- **Semanal:** Revisar logs de erro e performance
- **Mensal:** Analisar métricas de uso e otimizar queries
- **Trimestral:** Avaliar necessidade de novos índices
- **Anual:** Revisão completa da arquitetura

## 7. Rollback e Contingência

### 7.1 Estratégia de Rollback
```sql
-- Script de rollback para emergências
-- 1. Remover account_id das tabelas
ALTER TABLE transactions DROP COLUMN IF EXISTS account_id;
ALTER TABLE categories DROP COLUMN IF EXISTS account_id;

-- 2. Remover tabela accounts
DROP TABLE IF EXISTS accounts CASCADE;

-- 3. Restaurar políticas RLS originais
-- (manter backup das políticas antigas)
```

### 7.2 Plano de Contingência
- Backup automático antes de cada migração
- Feature flag para desabilitar funcionalidade
- Monitoramento em tempo real durante deploy
- Processo de rollback em menos de 5 minutos

## 8. Documentação e Treinamento

### 8.1 Documentação Técnica
- README atualizado com nova arquitetura
- Documentação de APIs e hooks
- Guia de troubleshooting
- Exemplos de uso dos componentes

### 8.2 Documentação de Usuário
- Tutorial de criação de contas
- FAQ sobre múltiplas contas
- Vídeo demonstrativo da funcionalidade
- Guia de migração para usuários existentes