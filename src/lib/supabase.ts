import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'entrada' | 'saida'
  category_id: string
  subcategory_id?: string
  title: string
  transaction_date: string
  description?: string
  created_at: string
  categories?: Category
  subcategories?: Subcategory
}

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  isCompleted: boolean
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: string
  goalId: string
  userId: string
  amount: number
  created_at: string
}

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    // Use backend API to register user (bypasses email confirmation issues)
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    // After successful registration, sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error('Registration successful but login failed. Please try logging in manually.');
    }

    return signInData;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helper functions
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  return { data, error }
}

export const getSubcategories = async (categoryId?: string) => {
  let query = supabase
    .from('subcategories')
    .select('*')
    .order('name')
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const getTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories(*),
      subcategories(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select(`
      *,
      categories(*),
      subcategories(*)
    `)
  return { data, error }
}

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  return { error }
}

export const getFinancialGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createFinancialGoal = async (goal: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'currentAmount' | 'isCompleted'>) => {
  const { data, error } = await supabase
    .from('financial_goals')
    .insert([goal])
    .select()
  return { data, error }
}

export const addGoalContribution = async (contribution: Omit<GoalContribution, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('goal_contributions')
    .insert([contribution])
    .select()
  return { data, error }
}

export const getGoalContributions = async (goalId: string) => {
  const { data, error } = await supabase
    .from('goal_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
  return { data, error }
}