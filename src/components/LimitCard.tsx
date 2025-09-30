import React, { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { LimitProgressBar } from './LimitProgressBar';
import { LimitProgress } from '../hooks/useCategoryLimits';
import { cn } from '../lib/utils';

export interface LimitCardProps {
  limitProgress: LimitProgress;
  onEdit: (limitProgress: LimitProgress) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'safe':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'exceeded':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <CheckCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getCardBorderColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'border-green-200 hover:border-green-300';
    case 'warning':
      return 'border-yellow-200 hover:border-yellow-300';
    case 'exceeded':
      return 'border-red-200 hover:border-red-300';
    default:
      return 'border-gray-200 hover:border-gray-300';
  }
};

export const LimitCard: React.FC<LimitCardProps> = ({
  limitProgress,
  onEdit,
  onDelete,
  className,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o limite para ${limitProgress.category}?`
    );
    
    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete(limitProgress.id);
      } catch (error) {
        console.error('Erro ao excluir limite:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md',
      getCardBorderColor(limitProgress.status),
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(limitProgress.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {limitProgress.category}
            </h3>
            <p className="text-sm text-gray-500">
              Criado em {formatDate(limitProgress.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(limitProgress)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar limite"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Excluir limite"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Gasto Atual
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(limitProgress.current_spent)}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Limite
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(limitProgress.limit_amount)}
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <LimitProgressBar
          percentage={limitProgress.percentage}
          status={limitProgress.status}
          currentSpent={limitProgress.current_spent}
          limitAmount={limitProgress.limit_amount}
          category={limitProgress.category}
          showLabels={false}
          size="lg"
        />
      </div>

      {/* Informações adicionais */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className={cn(
            'font-medium',
            limitProgress.status === 'safe' && 'text-green-600',
            limitProgress.status === 'warning' && 'text-yellow-600',
            limitProgress.status === 'exceeded' && 'text-red-600'
          )}>
            {limitProgress.percentage.toFixed(1)}% usado
          </span>
          
          {limitProgress.status === 'exceeded' && (
            <span className="text-red-600 font-medium">
              +{formatCurrency(limitProgress.current_spent - limitProgress.limit_amount)} excedido
            </span>
          )}
        </div>
        
        <span className="text-gray-500">
          Alerta: {limitProgress.alert_percentage}%
        </span>
      </div>

      {/* Status message */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className={cn(
          'text-sm font-medium',
          limitProgress.status === 'safe' && 'text-green-600',
          limitProgress.status === 'warning' && 'text-yellow-600',
          limitProgress.status === 'exceeded' && 'text-red-600'
        )}>
          {limitProgress.status === 'safe' && '✅ Gastos dentro do limite'}
          {limitProgress.status === 'warning' && '⚠️ Próximo ao limite de alerta'}
          {limitProgress.status === 'exceeded' && '🚨 Limite excedido!'}
        </p>
      </div>
    </div>
  );
};