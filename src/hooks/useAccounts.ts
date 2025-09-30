import { useAccount } from '../contexts/AccountContext';

export const useAccounts = () => {
  const { accounts, loading, error } = useAccount();

  return {
    accounts,
    loading,
    error
  };
};