import React, { useState } from 'react';
import { Plus, Filter, RefreshCw, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { useCategoryLimits, LimitProgress } from '../hooks/useCategoryLimits';
import { useLimitNotifications } from '../hooks/useLimitNotifications';
import { useAccounts } from '../hooks/useAccounts';
import { LimitCard } from '../components/LimitCard';
import { LimitModal } from '../components/LimitModal';
import { cn } from '../lib/utils';

const Limits: React.FC = () => {
  const { accounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<LimitProgress | null>(null);

  const {
    limits,
    limitsProgress,
    loading,
    error,
    createLimit,
    updateLimit,
    deleteLimit,
    refreshLimits,
  } = useCategoryLimits(selectedAccountId || undefined);

  const { notifications, checkLimits } = useLimitNotifications(selectedAccountId || undefined);

  // Filtrar limites por status
  const filteredLimits = limitsProgress.filter(limit => {
    if (statusFilter === 'all') return true;
    return limit.status === statusFilter;
  });

  // Estatísticas
  const stats = {
    total: limitsProgress.length,
    safe: limitsProgress.filter(l => l.status === 'safe').length,
    warning: limitsProgress.filter(l => l.status === 'warning').length,
    exceeded: limitsProgress.filter(l => l.status === 'exceeded').length,
    totalSpent: limitsProgress.reduce((sum, l) => sum + l.current_spent, 0),
    totalLimits: limitsProgress.reduce((sum, l) => sum + l.limit_amount, 0),
  };

  const handleCreateLimit = async (limitData: any) => {
    await createLimit(limitData);
    await checkLimits();
  };

  const handleUpdateLimit = async (id: string, updates: any) => {
    await updateLimit(id, updates);
    await checkLimits();
  };

  const handleDeleteLimit = async (id: string) => {
    await deleteLimit(id);
    await checkLimits();
  };

  const handleEditLimit = (limitProgress: LimitProgress) => {
    setEditingLimit(limitProgress);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLimit(null);
  };

  const handleRefresh = async () => {
    await refreshLimits();
    await checkLimits();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando limites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Limites por Categoria</h1>
          <p className="text-gray-600 mt-1">
            Configure e monitore seus limites de gastos por categoria
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Limite
          </button>
        </div>
      </div>

      {/* Notificações ativas */}
      {notifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-medium text-yellow-800">
              Alertas Ativos ({notifications.length})
            </h3>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 3).map((notification) => (
              <p key={notification.id} className="text-sm text-yellow-700">
                {notification.message}
              </p>
            ))}
            {notifications.length > 3 && (
              <p className="text-sm text-yellow-600">
                +{notifications.length - 3} outros alertas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Limites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gastos Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Excedidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.exceeded}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Filtro por conta */}
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>

            {/* Filtro por status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="safe">Dentro do limite</option>
              <option value="warning">Próximo ao limite</option>
              <option value="exceeded">Limite excedido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Limites */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar limites: {error}</p>
        </div>
      )}

      {filteredLimits.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {limitsProgress.length === 0 ? 'Nenhum limite configurado' : 'Nenhum limite encontrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {limitsProgress.length === 0
              ? 'Configure seus primeiros limites para começar a monitorar seus gastos'
              : 'Tente ajustar os filtros para encontrar os limites desejados'
            }
          </p>
          {limitsProgress.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Criar Primeiro Limite
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLimits.map((limitProgress) => (
            <LimitCard
              key={limitProgress.id}
              limitProgress={limitProgress}
              onEdit={handleEditLimit}
              onDelete={handleDeleteLimit}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <LimitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateLimit}
        onUpdate={handleUpdateLimit}
        editingLimit={editingLimit}
      />
    </div>
  );
};

export default Limits;