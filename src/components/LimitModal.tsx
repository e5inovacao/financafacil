import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CategoryLimit, LimitProgress } from '../hooks/useCategoryLimits';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { cn } from '../lib/utils';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currency';

export interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (limitData: Omit<CategoryLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<CategoryLimit>) => Promise<void>;
  editingLimit?: LimitProgress | null;
  className?: string;
}

interface FormData {
  account_id: string;
  category: string;
  limit_amount: string;
  alert_percentage: string;
}

const initialFormData: FormData = {
  account_id: '',
  category: '',
  limit_amount: '',
  alert_percentage: '90',
};

export const LimitModal: React.FC<LimitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingLimit,
  className,
}) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { accounts, loading: accountsLoading } = useAccounts();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingLimit;

  // Resetar form quando modal abrir/fechar ou mudar modo de edição
  useEffect(() => {
    if (isOpen) {
      if (editingLimit) {
        setFormData({
          account_id: editingLimit.account_id,
          category: editingLimit.category,
          limit_amount: formatCurrencyInput((editingLimit.limit_amount * 100).toString()),
          alert_percentage: editingLimit.alert_percentage.toString(),
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, editingLimit]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.account_id) {
      newErrors.account_id = 'Selecione uma conta';
    }

    if (!formData.category) {
      newErrors.category = 'Selecione uma categoria';
    }

    const limitAmount = parseCurrencyInput(formData.limit_amount);
    if (!formData.limit_amount || isNaN(limitAmount) || limitAmount <= 0) {
      newErrors.limit_amount = 'Digite um valor válido maior que zero';
    }

    const alertPercentage = parseFloat(formData.alert_percentage);
    if (!formData.alert_percentage || isNaN(alertPercentage) || alertPercentage < 1 || alertPercentage > 100) {
      newErrors.alert_percentage = 'Digite uma porcentagem entre 1 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const limitData = {
        account_id: formData.account_id,
        category: formData.category,
        limit_amount: parseCurrencyInput(formData.limit_amount),
        alert_percentage: parseFloat(formData.alert_percentage),
      };

      if (isEditing && editingLimit && onUpdate) {
        await onUpdate(editingLimit.id, limitData);
      } else {
        await onSave(limitData);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar limite:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    handleInputChange('limit_amount', formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        'bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Limite' : 'Novo Limite'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Conta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta *
            </label>
            <select
              value={formData.account_id}
              onChange={(e) => handleInputChange('account_id', e.target.value)}
              disabled={isEditing || accountsLoading}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.account_id ? 'border-red-300' : 'border-gray-300',
                (isEditing || accountsLoading) && 'bg-gray-100 cursor-not-allowed'
              )}
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {errors.account_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.account_id}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={isEditing || categoriesLoading}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.category ? 'border-red-300' : 'border-gray-300',
                (isEditing || categoriesLoading) && 'bg-gray-100 cursor-not-allowed'
              )}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Valor do Limite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Limite *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="text"
                value={formData.limit_amount}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                placeholder="0,00"
                className={cn(
                  'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                  errors.limit_amount ? 'border-red-300' : 'border-gray-300'
                )}
              />
            </div>
            {errors.limit_amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.limit_amount}
              </p>
            )}
          </div>

          {/* Porcentagem de Alerta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alerta em (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={formData.alert_percentage}
                onChange={(e) => handleInputChange('alert_percentage', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                  errors.alert_percentage ? 'border-red-300' : 'border-gray-300'
                )}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Você será notificado quando atingir esta porcentagem do limite
            </p>
            {errors.alert_percentage && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.alert_percentage}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar Limite'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};