import React from 'react';
import { cn } from '../lib/utils';

export interface LimitProgressBarProps {
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
  currentSpent: number;
  limitAmount: number;
  category: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'exceeded':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'bg-green-100';
    case 'warning':
      return 'bg-yellow-100';
    case 'exceeded':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'h-2';
    case 'md':
      return 'h-3';
    case 'lg':
      return 'h-4';
    default:
      return 'h-3';
  }
};

export const LimitProgressBar: React.FC<LimitProgressBarProps> = ({
  percentage,
  status,
  currentSpent,
  limitAmount,
  category,
  showLabels = true,
  size = 'md',
  className,
}) => {
  // Garantir que a porcentagem não ultrapasse 100% visualmente na barra
  const displayPercentage = Math.min(percentage, 100);
  const isExceeded = percentage > 100;

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {category}
          </span>
          <span className="text-sm text-gray-600">
            R$ {currentSpent.toFixed(2)} / R$ {limitAmount.toFixed(2)}
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* Barra de fundo */}
        <div className={cn(
          'w-full rounded-full overflow-hidden',
          getSizeClasses(size),
          getStatusBgColor(status)
        )}>
          {/* Barra de progresso */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-in-out',
              getStatusColor(status)
            )}
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
        
        {/* Indicador de excesso */}
        {isExceeded && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
          </div>
        )}
      </div>
      
      {showLabels && (
        <div className="flex justify-between items-center mt-1">
          <span className={cn(
            'text-xs font-medium',
            status === 'safe' && 'text-green-600',
            status === 'warning' && 'text-yellow-600',
            status === 'exceeded' && 'text-red-600'
          )}>
            {percentage.toFixed(1)}%
          </span>
          
          {isExceeded && (
            <span className="text-xs text-red-600 font-medium">
              +R$ {(currentSpent - limitAmount).toFixed(2)}
            </span>
          )}
        </div>
      )}
      
      {/* Status text */}
      {showLabels && (
        <div className="mt-1">
          <span className={cn(
            'text-xs',
            status === 'safe' && 'text-green-600',
            status === 'warning' && 'text-yellow-600',
            status === 'exceeded' && 'text-red-600'
          )}>
            {status === 'safe' && 'Dentro do limite'}
            {status === 'warning' && 'Próximo ao limite'}
            {status === 'exceeded' && 'Limite excedido'}
          </span>
        </div>
      )}
    </div>
  );
};

export default LimitProgressBar;