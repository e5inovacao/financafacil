import React, { useState } from 'react'
import { Plus, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../utils/currency'
import { toast } from 'sonner'
import { useAccountGoals } from '../hooks/useAccountGoals'
import type { FinancialGoal, GoalContribution } from '../lib/supabase'



const Goals: React.FC = () => {
  const {
    goals,
    loading,
    createGoal,
    addToGoal,
    getGoalProgress
  } = useAccountGoals()
  const [showForm, setShowForm] = useState(false)
  const [showContributionForm, setShowContributionForm] = useState<string | null>(null)
  const [showCongratulations, setShowCongratulations] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: ''
  })
  const [contributionAmount, setContributionAmount] = useState('')





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const targetAmount = parseCurrencyInput(formData.target_amount)
      
      if (targetAmount <= 0) {
        toast.error('O valor alvo deve ser maior que zero')
        return
      }

      await createGoal({
        title: formData.name,
        target_amount: targetAmount,
        target_date: formData.target_date
      })
      
      setFormData({ name: '', target_amount: '', target_date: '' })
      setShowForm(false)
      toast.success('Meta criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar meta:', error)
      toast.error('Erro ao criar meta')
    }
  }

  const handleContribution = async (goalId: string) => {
    if (!contributionAmount) return

    try {
      const amount = parseFloat(contributionAmount)
      
      if (amount <= 0) {
        toast.error('O valor do aporte deve ser maior que zero')
        return
      }

      await addToGoal(goalId, amount)
      
      setContributionAmount('')
      setShowContributionForm(null)
      
      // Check if goal reached 100% after contribution
      const updatedGoal = goals.find(g => g.id === goalId)
      if (updatedGoal && getGoalProgress(updatedGoal) >= 100) {
        setShowCongratulations(goalId)
        setTimeout(() => setShowCongratulations(null), 5000)
      }
      
      toast.success('Aporte adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar aporte:', error)
      toast.error('Erro ao adicionar aporte')
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Metas Financeiras</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#16c64f] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Meta Financeira</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                  placeholder="Ex: Viagem para Europa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Alvo
                </label>
                <input
                  type="text"
                  value={formData.target_amount}
                  onChange={(e) => {
                    const formattedValue = formatCurrencyInput(e.target.value)
                    setFormData({ ...formData, target_amount: formattedValue })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Alvo
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-[#16c64f] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Criar Meta
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-[#fefdf9] rounded-lg shadow-lg p-6 relative">
            {/* Congratulations Popup */}
            {showCongratulations === goal.id && (
              <div className="absolute inset-0 bg-[#16c64f] bg-opacity-95 rounded-lg flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Target className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Parabéns!</h3>
                  <p className="text-sm">Você atingiu sua meta!</p>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.title}</h3>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(goal.target_date || '').toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <Target className="w-8 h-8 text-[#16c64f]" />
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{getGoalProgress(goal).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#16c64f] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getGoalProgress(goal)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCurrency(goal.current_amount)}</span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
            </div>

            {/* Contribution Form */}
            {showContributionForm === goal.id ? (
              <div className="space-y-3">
                <input
                  type="number"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Valor do aporte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContribution(goal.id)}
                    className="flex-1 bg-[#16c64f] text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setShowContributionForm(null)
                      setContributionAmount('')
                    }}
                    className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowContributionForm(goal.id)}
                className="w-full bg-[#16c64f] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                disabled={getGoalProgress(goal) >= 100}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{getGoalProgress(goal) >= 100 ? 'Meta Atingida!' : 'Fazer Aporte'}</span>
              </button>
            )}


          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta criada</h3>
          <p className="text-gray-600 mb-4">Comece criando sua primeira meta financeira</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#16c64f] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Criar Primeira Meta
          </button>
        </div>
      )}
    </div>
  )
}

export default Goals