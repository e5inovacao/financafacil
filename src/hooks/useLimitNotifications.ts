import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useCategoryLimits, LimitProgress } from './useCategoryLimits';
import { useAuthStore } from '../lib/auth-store';

export interface LimitNotification {
  id: string;
  category: string;
  limitAmount: number;
  currentSpent: number;
  percentage: number;
  status: 'warning' | 'exceeded';
  message: string;
  timestamp: Date;
}

export interface UseLimitNotificationsReturn {
  notifications: LimitNotification[];
  checkLimits: () => Promise<void>;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  hasActiveNotifications: boolean;
}

export const useLimitNotifications = (accountId?: string): UseLimitNotificationsReturn => {
  const { user } = useAuthStore();
  const { limitsProgress, refreshLimits } = useCategoryLimits(accountId);
  const [notifications, setNotifications] = useState<LimitNotification[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const generateNotificationMessage = (progress: LimitProgress): string => {
    const { category, percentage, status, current_spent, limit_amount } = progress;
    
    if (status === 'exceeded') {
      const excess = current_spent - limit_amount;
      return `Limite de ${category} excedido! Você gastou R$ ${current_spent.toFixed(2)} (R$ ${excess.toFixed(2)} acima do limite de R$ ${limit_amount.toFixed(2)})`;
    } else if (status === 'warning') {
      return `Atenção: Você já gastou ${percentage.toFixed(1)}% do limite de ${category} (R$ ${current_spent.toFixed(2)} de R$ ${limit_amount.toFixed(2)})`;
    }
    
    return '';
  };

  const createNotification = (progress: LimitProgress): LimitNotification => {
    return {
      id: `${progress.id}-${Date.now()}`,
      category: progress.category,
      limitAmount: progress.limit_amount,
      currentSpent: progress.current_spent,
      percentage: progress.percentage,
      status: progress.status as 'warning' | 'exceeded',
      message: generateNotificationMessage(progress),
      timestamp: new Date(),
    };
  };

  const showToastNotification = (notification: LimitNotification) => {
    const toastOptions = {
      duration: 6000,
      position: 'top-right' as const,
    };

    if (notification.status === 'exceeded') {
      toast.error(notification.message, {
        ...toastOptions,
        icon: '🚨',
      });
    } else if (notification.status === 'warning') {
      toast(notification.message, {
        ...toastOptions,
        icon: '⚠️',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #F59E0B',
        },
      });
    }
  };

  const checkLimits = useCallback(async () => {
    if (!user || !limitsProgress.length) {
      return;
    }

    try {
      // Atualizar dados dos limites
      await refreshLimits();
      
      const newNotifications: LimitNotification[] = [];
      const currentTime = new Date();

      limitsProgress.forEach((progress) => {
        // Verificar se precisa de notificação
        if (progress.status === 'warning' || progress.status === 'exceeded') {
          // Verificar se já existe uma notificação recente para esta categoria
          const existingNotification = notifications.find(
            (n) => n.category === progress.category && 
                   (currentTime.getTime() - n.timestamp.getTime()) < 30 * 60 * 1000 // 30 minutos
          );

          if (!existingNotification) {
            const notification = createNotification(progress);
            newNotifications.push(notification);
            showToastNotification(notification);
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Manter apenas as 10 mais recentes
      }

      setLastChecked(currentTime);
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
    }
  }, [user, limitsProgress, notifications, refreshLimits]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Verificar limites automaticamente quando os dados mudarem
  useEffect(() => {
    if (limitsProgress.length > 0) {
      checkLimits();
    }
  }, [limitsProgress]);

  // Verificar limites periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkLimits();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user, checkLimits]);

  // Limpar notificações antigas (mais de 2 horas)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      setNotifications(prev => 
        prev.filter(n => n.timestamp > twoHoursAgo)
      );
    }, 30 * 60 * 1000); // Verificar a cada 30 minutos

    return () => clearInterval(cleanupInterval);
  }, []);

  const hasActiveNotifications = notifications.length > 0;

  return {
    notifications,
    checkLimits,
    dismissNotification,
    clearAllNotifications,
    hasActiveNotifications,
  };
};