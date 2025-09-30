import { useState, useEffect } from 'react';
import { getCategories } from '../lib/supabase';
import type { Category } from '../lib/supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getCategories();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  };
};