import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { getTransactions, getCategories } from '../lib/supabase'
import { useAuthStore } from '../lib/auth-store'
import type { Transaction, Category } from '../lib/supabase'

interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

const Charts: React.FC = () => {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6') // months

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
          getTransactions(user.id),
          getCategories()
      ])
      setTransactions(transactionsData.data || [])
      setCategories(categoriesData.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthlyData = (): MonthlyData[] => {
    const months = parseInt(selectedPeriod)
    const now = new Date()
    const monthlyData: MonthlyData[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.created_at)
        const transactionKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`
        return transactionKey === monthKey
      })

      const income = monthTransactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0)

      monthlyData.push({
        month: monthName,
        income,
        expense,
        balance: income - expense
      })
    }

    return monthlyData
  }

  const getCategoryData = (type: 'entrada' | 'saida'): CategoryData[] => {
    const categoryTotals = new Map<string, number>()
    const colors = [
      '#16c64f', '#22c55e', '#34d399', '#6ee7b7', '#a7f3d0',
      '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fed7d7',
      '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'
    ]

    transactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const categoryName = transaction.categories?.name || 'Outros'
        const currentTotal = categoryTotals.get(categoryName) || 0
        categoryTotals.set(categoryName, currentTotal + transaction.amount)
      })

    return Array.from(categoryTotals.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 categories
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p style={{ color: data.payload.color }} className="text-sm">
            {formatCurrency(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16c64f]"></div>
      </div>
    )
  }

  const monthlyData = getMonthlyData()
  const incomeByCategory = getCategoryData('entrada')
  const expenseByCategory = getCategoryData('saida')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gráficos Financeiros</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16c64f] focus:border-transparent"
        >
          <option value="3">Últimos 3 meses</option>
          <option value="6">Últimos 6 meses</option>
          <option value="12">Últimos 12 meses</option>
        </select>
      </div>

      {/* Expense by Category - Moved to first position */}
      <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h2>
        {expenseByCategory.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhuma despesa encontrada
          </div>
        )}
      </div>

      {/* Monthly Income vs Expense */}
      <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Receitas vs Despesas Mensais</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#16c64f" name="Receitas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance Trend */}
      <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Saldo</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#16c64f" 
                strokeWidth={3}
                name="Saldo"
                dot={{ fill: '#16c64f', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#16c64f', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income by Category */}
      <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h2>
        {incomeByCategory.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhuma receita encontrada
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total de Receitas</h3>
          <p className="text-2xl font-bold text-[#16c64f]">
            {formatCurrency(transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0))}
          </p>
        </div>
        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total de Despesas</h3>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0))}
          </p>
        </div>
        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Saldo Total</h3>
          <p className={`text-2xl font-bold ${
            transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0) -
            transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0) >= 0
              ? 'text-[#16c64f]' : 'text-red-500'
          }`}>
            {formatCurrency(
              transactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0) -
              transactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Charts