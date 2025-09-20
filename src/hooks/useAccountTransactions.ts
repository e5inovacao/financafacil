import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAccount } from '../contexts/AccountContext';
import type { Transaction } from '../lib/supabase';

export const useAccountTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentAccount } = useAccount();

  // Carregar transações da conta atual
  const loadTransactions = async () => {
    if (!currentAccount) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(id, name, color),
          subcategory:subcategories(id, name)
        `)
        .eq('account_id', currentAccount.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova transação na conta atual
  const createTransaction = async (transactionData: {
    amount: number;
    type: 'entrada' | 'saida';
    title: string;
    description?: string;
    category_id?: string;
    subcategory_id?: string;
    transaction_date?: string;
  }): Promise<Transaction | null> => {
    if (!currentAccount) {
      setError('Nenhuma conta selecionada');
      return null;
    }

    try {
      setError(null);
      
      const { data, error: createError } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          account_id: currentAccount.id,
          user_id: currentAccount.user_id
        })
        .select(`
          *,
          category:categories(id, name, color),
          subcategory:subcategories(id, name)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      await loadTransactions();
      return data;
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      setError('Erro ao criar transação');
      return null;
    }
  };

  // Atualizar transação
  const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await loadTransactions();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar transação:', err);
      setError('Erro ao atualizar transação');
      return false;
    }
  };

  // Deletar transação
  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      await loadTransactions();
      return true;
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
      setError('Erro ao deletar transação');
      return false;
    }
  };

  // Calcular totais da conta
  const getTotals = () => {
    const income = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      income,
      expense,
      balance: income - expense
    };
  };

  // Recarregar quando a conta atual mudar
  useEffect(() => {
    loadTransactions();
  }, [currentAccount]);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: loadTransactions,
    totals: getTotals()
  };
};

export default useAccountTransactions;