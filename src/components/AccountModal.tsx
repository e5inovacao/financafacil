import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useAccount, Account } from '../contexts/AccountContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null;
  mode: 'create' | 'edit';
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  mode
}) => {
  const { createAccount, updateAccount, setCurrentAccount } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetar form quando modal abrir/fechar ou account mudar
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && account) {
        setFormData({
          name: account.name,
          is_default: account.is_default
        });
      } else {
        setFormData({
          name: '',
          is_default: false
        });
      }
      setError(null);
    }
  }, [isOpen, account, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome da conta é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        const newAccount = await createAccount(formData.name, formData.is_default);
        // Automaticamente selecionar a nova conta como atual
        if (newAccount) {
          setCurrentAccount(newAccount);
        }
      } else if (mode === 'edit' && account) {
        await updateAccount(account.id, formData.name);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar conta:', err);
      setError('Erro ao salvar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Nova Conta' : 'Editar Conta'}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Nome da conta */}
            <div className="mb-4">
              <label 
                htmlFor="account-name" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome da conta
              </label>
              <input
                id="account-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Conta Corrente, Poupança, Carteira..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Conta padrão */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Definir como conta padrão
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                A conta padrão será selecionada automaticamente ao fazer login
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Criar' : 'Salvar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountModal;