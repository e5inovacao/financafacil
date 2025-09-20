import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAccount } from '../contexts/AccountContext';
import type { Goal } from '../lib/supabase';

export const useAccountGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentAccount } = useAccount();

  // Carregar metas da conta atual
  const loadGoals = async () => {
    if (!currentAccount) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setGoals(data || []);
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
      setError('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova meta na conta atual
  const createGoal = async (goalData: {
    title: string;
    description?: string;
    target_amount: number;
    current_amount?: number;
    target_date?: string;
    category?: string;
  }): Promise<Goal | null> => {
    if (!currentAccount) {
      setError('Nenhuma conta selecionada');
      return null;
    }

    try {
      setError(null);
      
      const { data, error: createError } = await supabase
        .from('financial_goals')
        .insert({
          ...goalData,
          account_id: currentAccount.id,
          user_id: currentAccount.user_id,
          current_amount: goalData.current_amount || 0
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      await loadGoals();
      return data;
    } catch (err) {
      console.error('Erro ao criar meta:', err);
      setError('Erro ao criar meta');
      return null;
    }
  };

  // Atualizar meta
  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await loadGoals();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar meta:', err);
      setError('Erro ao atualizar meta');
      return false;
    }
  };

  // Deletar meta
  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      await loadGoals();
      return true;
    } catch (err) {
      console.error('Erro ao deletar meta:', err);
      setError('Erro ao deletar meta');
      return false;
    }
  };

  // Adicionar valor à meta
  const addToGoal = async (id: string, amount: number): Promise<boolean> => {
    const goal = goals.find(g => g.id === id);
    if (!goal) {
      setError('Meta não encontrada');
      return false;
    }

    const newAmount = Number(goal.current_amount) + amount;
    return await updateGoal(id, { current_amount: newAmount });
  };

  // Calcular progresso da meta
  const getGoalProgress = (goal: Goal) => {
    const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
    return Math.min(progress, 100);
  };

  // Verificar se meta está completa
  const isGoalComplete = (goal: Goal) => {
    return Number(goal.current_amount) >= Number(goal.target_amount);
  };

  // Obter estatísticas das metas
  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(isGoalComplete).length;
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return {
      total,
      completed,
      pending: total - completed,
      totalTarget,
      totalCurrent,
      overallProgress: Math.min(overallProgress, 100)
    };
  };

  // Recarregar quando a conta atual mudar
  useEffect(() => {
    loadGoals();
  }, [currentAccount]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    refreshGoals: loadGoals,
    getGoalProgress,
    isGoalComplete,
    stats: getGoalStats()
  };
};

export default useAccountGoals;