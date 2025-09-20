import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth-store';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountContextType {
  accounts: Account[];
  currentAccount: Account | null;
  loading: boolean;
  error: string | null;
  setCurrentAccount: (account: Account) => void;
  createAccount: (name: string, isDefault?: boolean) => Promise<Account | null>;
  updateAccount: (id: string, name: string) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccount, setCurrentAccountState] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  // Carregar contas do usuário
  const loadAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setCurrentAccountState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setAccounts(data || []);
      
      // Definir conta atual como a padrão se não houver uma selecionada
      if (!currentAccount && data && data.length > 0) {
        const defaultAccount = data.find(acc => acc.is_default) || data[0];
        setCurrentAccountState(defaultAccount);
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova conta
  const createAccount = async (name: string, isDefault: boolean = false): Promise<Account | null> => {
    if (!user) return null;

    try {
      setError(null);
      
      const { data, error: createError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: name.trim(),
          is_default: isDefault
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      await loadAccounts();
      return data;
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      setError('Erro ao criar conta');
      return null;
    }
  };

  // Atualizar conta
  const updateAccount = async (id: string, name: string): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ name: name.trim() })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await loadAccounts();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      setError('Erro ao atualizar conta');
      return false;
    }
  };

  // Deletar conta
  const deleteAccount = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Não permitir deletar conta padrão
      const account = accounts.find(acc => acc.id === id);
      if (account?.is_default) {
        setError('Não é possível deletar a conta padrão');
        return false;
      }

      const { error: deleteError } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Se a conta deletada era a atual, mudar para a padrão
      if (currentAccount?.id === id) {
        const defaultAccount = accounts.find(acc => acc.is_default);
        setCurrentAccountState(defaultAccount || null);
      }

      await loadAccounts();
      return true;
    } catch (err) {
      console.error('Erro ao deletar conta:', err);
      setError('Erro ao deletar conta');
      return false;
    }
  };

  // Definir conta atual
  const setCurrentAccount = (account: Account) => {
    setCurrentAccountState(account);
  };

  // Atualizar contas
  const refreshAccounts = async () => {
    await loadAccounts();
  };

  // Carregar contas quando o usuário mudar
  useEffect(() => {
    loadAccounts();
  }, [user]);

  const value: AccountContextType = {
    accounts,
    currentAccount,
    loading,
    error,
    setCurrentAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};