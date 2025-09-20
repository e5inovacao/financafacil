import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Star, StarOff } from 'lucide-react';
import { useAccount, Account } from '../contexts/AccountContext';
import AccountModal from './AccountModal';
import DeleteAccountModal from './DeleteAccountModal';

interface AccountManagerProps {
  className?: string;
}

export const AccountManager: React.FC<AccountManagerProps> = ({ className = '' }) => {
  const { accounts, deleteAccount, setCurrentAccount, loading } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteAccount(accountToDelete.id);
      setDeleteModalOpen(false);
      setAccountToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setAccountToDelete(null);
  };

  const handleSetAsDefault = (account: Account) => {
    setCurrentAccount(account);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gerenciar Contas</h2>
        <button
          onClick={handleCreateAccount}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </button>
      </div>

      {/* Lista de contas */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma conta encontrada</p>
            <button
              onClick={handleCreateAccount}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira conta
            </button>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{account.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {account.is_default && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Padrão
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Criada em {new Date(account.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Botão para definir como padrão */}
                  {!account.is_default && (
                    <button
                      onClick={() => handleSetAsDefault(account)}
                      className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Definir como conta padrão"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  
                  {account.is_default && (
                    <div className="p-2 text-yellow-500" title="Conta padrão">
                      <StarOff className="w-4 h-4" />
                    </div>
                  )}

                  {/* Botão de editar */}
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar conta"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Botão de deletar */}
                  <button
                    onClick={() => handleDeleteClick(account)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>


            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        account={selectedAccount}
        mode={modalMode}
      />
      
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        account={accountToDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AccountManager;