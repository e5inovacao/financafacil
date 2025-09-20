import React, { useState } from 'react';
import { ChevronDown, Plus, Settings, Check } from 'lucide-react';
import { useAccount } from '../contexts/AccountContext';
import { Account } from '../contexts/AccountContext';
import { useNavigate } from 'react-router-dom';

interface AccountSelectorProps {
  onCreateAccount?: () => void;
  className?: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  onCreateAccount,
  className = ''
}) => {
  const { accounts, currentAccount, setCurrentAccount, loading } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAccountSelect = (account: Account) => {
    setCurrentAccount(account);
    setIsOpen(false);
  };

  const handleCreateAccount = () => {
    setIsOpen(false);
    onCreateAccount?.();
  };

  const handleManageAccounts = () => {
    setIsOpen(false);
    navigate('/accounts');
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="font-medium text-gray-900">
            {currentAccount?.name || 'Selecionar conta'}
          </span>
          {currentAccount?.is_default && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Padrão
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar o dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {/* Lista de contas */}
            <div className="py-1">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountSelect(account)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-gray-900">
                      {account.name}
                    </span>
                    {account.is_default && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  {currentAccount?.id === account.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Separador */}
            <div className="border-t border-gray-100"></div>

            {/* Ações */}
            <div className="py-1">
              {onCreateAccount && (
                <button
                  onClick={handleCreateAccount}
                  className="flex items-center w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="font-medium">Nova conta</span>
                </button>
              )}
              
              <button
                onClick={handleManageAccounts}
                className="flex items-center w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="font-medium">Gerenciar contas</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSelector;