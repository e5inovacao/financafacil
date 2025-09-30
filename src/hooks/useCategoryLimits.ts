import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth-store';
import { toast } from 'react-hot-toast';

export interface CategoryLimit {
  id: string;
  user_id: string;
  account_id: string;
  category: string;
  limit_amount: number;
  alert_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface LimitProgress {
  id: string;
  user_id: string;
  account_id: string;
  category: string;
  limit_amount: number;
  alert_percentage: number;
  current_spent: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
  created_at: string;
  updated_at: string;
}

export interface UseCategoryLimitsReturn {
  limits: CategoryLimit[];
  limitsProgress: LimitProgress[];
  loading: boolean;
  error: string | null;
  createLimit: (limit: Omit<CategoryLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLimit: (id: string, updates: Partial<CategoryLimit>) => Promise<void>;
  deleteLimit: (id: string) => Promise<void>;
  refreshLimits: () => Promise<void>;
}

export const useCategoryLimits = (accountId?: string): UseCategoryLimitsReturn => {
  const { user } = useAuthStore();
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [limitsProgress, setLimitsProgress] = useState<LimitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    if (!user) {
      setLimits([]);
      setLimitsProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar limites básicos com fallback
      let limitsQuery = supabase
        .from('category_limits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accountId) {
        limitsQuery = limitsQuery.eq('account_id', accountId);
      }

      const { data: limitsData, error: limitsError } = await limitsQuery;

      if (limitsError) {
        // Verificar se é erro de tabela não encontrada
        if (limitsError.message?.includes('relation "category_limits" does not exist')) {
          console.warn('Tabela category_limits não existe ainda');
          setLimits([]);
          setLimitsProgress([]);
          setLoading(false);
          return;
        }
        throw limitsError;
      }

      // Buscar progresso dos limites com fallback
      let progressQuery = supabase
        .from('category_limits_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accountId) {
        progressQuery = progressQuery.eq('account_id', accountId);
      }

      const { data: progressData, error: progressError } = await progressQuery;

      if (progressError) {
        // Verificar se é erro de view não encontrada
        if (progressError.message?.includes('relation "category_limits_progress" does not exist')) {
          console.warn('View category_limits_progress não existe ainda');
          setLimitsProgress([]);
        } else {
          throw progressError;
        }
      } else {
        setLimitsProgress(progressData || []);
      }

      setLimits(limitsData || []);
    } catch (err) {
      console.error('Erro ao buscar limites:', err);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = 'Erro ao carregar limites';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (err.message.includes('permission denied')) {
          errorMessage = 'Sem permissão para acessar os dados.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Não mostrar toast para erros de tabela não encontrada
      if (!errorMessage.includes('não existe')) {
        toast.error(errorMessage);
      }
      
      // Fallback: definir arrays vazios em caso de erro
      setLimits([]);
      setLimitsProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const createLimit = async (limitData: Omit<CategoryLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('category_limits')
        .insert({
          ...limitData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Limite criado com sucesso!');
      await fetchLimits();
    } catch (err) {
      console.error('Erro ao criar limite:', err);
      
      let errorMessage = 'Erro ao criar limite';
      
      if (err instanceof Error) {
        if (err.message.includes('duplicate key')) {
          errorMessage = 'Já existe um limite para esta categoria nesta conta';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (err.message.includes('relation "category_limits" does not exist')) {
          errorMessage = 'Sistema de limites não configurado. Contate o administrador.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateLimit = async (id: string, updates: Partial<CategoryLimit>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('category_limits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Limite atualizado com sucesso!');
      await fetchLimits();
    } catch (err) {
      console.error('Erro ao atualizar limite:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao atualizar limite');
      throw err;
    }
  };

  const deleteLimit = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { error } = await supabase
        .from('category_limits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Limite excluído com sucesso!');
      await fetchLimits();
    } catch (err) {
      console.error('Erro ao excluir limite:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao excluir limite');
      throw err;
    }
  };

  const refreshLimits = async () => {
    await fetchLimits();
  };

  useEffect(() => {
    fetchLimits();
  }, [user, accountId]);

  return {
    limits,
    limitsProgress,
    loading,
    error,
    createLimit,
    updateLimit,
    deleteLimit,
    refreshLimits,
  };
};