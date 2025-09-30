import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { getCategories, getSubcategories, getTransactions, createTransaction, deleteTransaction } from '../lib/supabase'
import { useAuthStore } from '../lib/auth-store'
import type { Category, Subcategory, Transaction } from '../lib/supabase'
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../utils/currency'
import { toast } from 'sonner'
import { useAccountTransactions } from '../hooks/useAccountTransactions'
import { useAccount } from '../contexts/AccountContext'
import { supabase } from '../lib/supabase'
import AccountSelector from '../components/AccountSelector'
import AccountModal from '../components/AccountModal'
import { useCategoryLimits } from '../hooks/useCategoryLimits'
import { useLimitNotifications } from '../hooks/useLimitNotifications'
import LimitProgressBar from '../components/LimitProgressBar'



const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const { currentAccount } = useAccount()
  const {
    transactions,
    loading,
    createTransaction,
    deleteTransaction,
    totals
  } = useAccountTransactions()
  
  const { limits, limitsProgress: progress, loading: limitsLoading } = useCategoryLimits()
  const { checkLimits, notifications, hasActiveNotifications } = useLimitNotifications()
  
  const { balance, income: totalIncome, expense: totalExpense } = totals
  const [categories, setCategories] = useState<Category[]>([])  
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])  
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showLimitNotification, setShowLimitNotification] = useState(true)
  // Formulário sempre visível - removido estado showForm
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0], // Data atual como padrão
    type: 'saida' as 'entrada' | 'saida',
    category_id: '',
    subcategory_id: '',
    description: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  // Verificar limites automaticamente quando o Dashboard carregar
  useEffect(() => {
    if (user && currentAccount) {
      // Aguardar um pouco para garantir que os dados estejam carregados
      const timer = setTimeout(() => {
        checkLimits()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [user, currentAccount, checkLimits])

  const loadCategories = async (transactionType?: string) => {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name')

      // Filtrar categorias baseado no tipo de transação
      if (transactionType) {
        if (transactionType === 'entrada') {
          // Categorias típicas de receita
          query = query.in('name', ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros Rendimentos'])
        } else if (transactionType === 'saida') {
          // Categorias típicas de despesa
          query = query.not('name', 'in', '("Salário","Freelance","Investimentos","Vendas","Outros Rendimentos")')
        }
      }

      const { data, error } = await query
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    }
  }

  const loadSubcategories = async (categoryId: string) => {
    try {
      const subcategoriesData = await getSubcategories(categoryId)
      setSubcategories(subcategoriesData.data || [])
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category_id: categoryId, subcategory_id: '' })
    if (categoryId) {
      loadSubcategories(categoryId)
    } else {
      setSubcategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validação do valor
    const amount = parseCurrencyInput(formData.amount)
    if (amount <= 0) {
      alert('Por favor, insira um valor válido maior que zero.')
      return
    }

    // Validação dos campos obrigatórios
    if (!formData.title.trim()) {
      alert('Por favor, insira um título.')
      return
    }

    if (!formData.category_id) {
      alert('Por favor, selecione uma categoria.')
      return
    }

    // Validação da data
    const selectedDate = new Date(formData.transaction_date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fim do dia atual
    
    if (selectedDate > today) {
      alert('A data da transação não pode ser futura.')
      return
    }

    try {
      await createTransaction({
        title: formData.title.trim(),
        amount: amount,
        type: formData.type,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        transaction_date: formData.transaction_date,
        description: formData.description.trim() || undefined
      })
      
      // Limpa o formulário apenas se a transação foi salva com sucesso
      setFormData({
        title: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'saida',
        category_id: '',
        subcategory_id: '',
        description: ''
      })
      setSubcategories([])
      toast.success('Transação salva com sucesso!')
      
      // Verificar limites após criar transação
      setTimeout(() => {
        checkLimits()
      }, 1000)
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      toast.error(`Erro inesperado ao salvar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id)
        toast.success('Transação excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir transação:', error)
        toast.error(`Erro inesperado ao excluir transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16c64f]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notificação de Limites - Acima do título */}
      {showLimitNotification && hasActiveNotifications && notifications.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {notifications.length} limite(s) próximo(s) do valor máximo
              </span>
              <a 
                href="/limits" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ver detalhes
              </a>
            </div>
            <button
              onClick={() => setShowLimitNotification(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Painel Financeiro</h1>
        <div className="w-64">
          <AccountSelector
            onCreateAccount={() => setShowAccountModal(true)}
          />
        </div>
      </div>



      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Total</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#16c64f]' : 'text-red-500'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entradas</p>
              <p className="text-2xl font-bold text-[#16c64f]">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#16c64f]" />
          </div>
        </div>

        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Saídas</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>



      {/* Transaction Form */}
      <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Transação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const formattedValue = formatCurrencyInput(e.target.value)
                    setFormData({ ...formData, amount: formattedValue })
                  }}
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Transação
                </label>
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as 'entrada' | 'saida';
                    setFormData({ ...formData, type: newType, category_id: '', subcategory_id: '' });
                    loadCategories(newType); // Recarregar categorias filtradas
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                >
                  <option value="saida">Despesa</option>
                  <option value="entrada">Receita</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria
                </label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  disabled={!formData.category_id}
                >
                  <option value="">Selecione uma subcategoria</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Adicione uma descrição detalhada da transação..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-[#16c64f] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    amount: '',
                    transaction_date: new Date().toISOString().split('T')[0],
                    type: 'saida',
                    category_id: '',
                    subcategory_id: '',
                    description: ''
                  })
                  setSubcategories([])
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>



      {/* Widget de Limites - Minimalista */}
      {!limitsLoading && progress && progress.filter(p => p.status !== 'safe').length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Status dos Limites</h3>
            <div className="flex items-center space-x-3">
              {progress.filter(p => p.status === 'exceeded').length > 0 && (
                <span className="text-xs text-red-600">
                  {progress.filter(p => p.status === 'exceeded').length} excedido(s)
                </span>
              )}
              {progress.filter(p => p.status === 'warning').length > 0 && (
                <span className="text-xs text-amber-600">
                  {progress.filter(p => p.status === 'warning').length} alerta(s)
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {progress
              .filter(p => p.status !== 'safe')
              .slice(0, 3)
              .map((item) => (
                <div key={`${item.category}-${item.account_id}`} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.status === 'exceeded' ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
          
          {progress.filter(p => p.status !== 'safe').length > 3 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <a 
                href="/limits" 
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Ver todos ({progress.filter(p => p.status !== 'safe').length - 3} mais)
              </a>
            </div>
          )}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-[#fefdf9] rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transações Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.title || transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.categories?.name}
                    {transaction.subcategories && (
                      <span className="text-gray-400"> / {transaction.subcategories.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'entrada' ? 'text-[#16c64f]' : 'text-red-500'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          )}
        </div>
      </div>

      {/* Account Modal */}
      <AccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          mode="create"
        />
    </div>
  )
}

export default Dashboard