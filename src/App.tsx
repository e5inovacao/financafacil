import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/auth-store'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import Charts from './pages/Charts'

// Componente que decide se mostra a landing page ou redireciona para o dashboard
function HomeRoute() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3ef] flex items-center justify-center">
        <div className="bg-[#fefdf9] rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#16c64f]"></div>
            <span className="text-gray-700">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Se o usuário está logado, redireciona para o dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Se não está logado, mostra a landing page
  return <Home />
}

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Layout>
              <Goals />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/charts" element={
          <ProtectedRoute>
            <Layout>
              <Charts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/" element={<HomeRoute />} />
      </Routes>
    </Router>
  )
}

export default App
