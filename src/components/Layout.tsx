import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Target, LogOut, User, Settings, Menu, X, ArrowLeft } from 'lucide-react'
import { signOut } from '../lib/supabase'
import { useAuthStore } from '../lib/auth-store'
import AccountModal from './AccountModal'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard')
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const mainMenuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Painel Finanças'
    },
    {
      path: '/charts',
      icon: BarChart3,
      label: 'Gráficos'
    },
    {
      path: '/goals',
      icon: Target,
      label: 'Metas'
    }
  ]

  const bottomMenuItems = [
    {
      path: '/accounts',
      icon: Settings,
      label: 'Contas'
    }
  ]

  return (
    <div className="h-screen bg-[#f1f3ef] flex overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#16c64f] shadow-lg z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackClick}
            className="text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-lg font-bold">Finança Fácil</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative top-0 left-0 w-64 bg-[#16c64f] shadow-lg flex flex-col h-full z-50 transition-transform duration-300 ease-in-out lg:transition-none`}>
        {/* Logo - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block p-6 border-b border-green-400">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackClick}
              className="text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white text-xl font-bold">Finança Fácil</h1>
          </div>
        </div>

        {/* Mobile menu header */}
        <div className="lg:hidden p-6 border-b border-green-400">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">Menu</h1>
            <button
              onClick={closeMobileMenu}
              className="text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col overflow-y-auto">
          {/* Main menu items */}
          <ul className="space-y-2">
            {mainMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white text-[#16c64f] shadow-md'
                        : 'text-white hover:bg-green-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Bottom menu items */}
          <ul className="space-y-2 mb-4">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white text-[#16c64f] shadow-md'
                        : 'text-white hover:bg-green-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-green-400">
          <div className="flex items-center space-x-3 text-white mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-[#16c64f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.name || user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleSignOut()
              closeMobileMenu()
            }}
            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-green-500 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-y-auto p-6 pt-20 lg:pt-6">
          {children}
        </main>
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        mode="create"
      />


    </div>
  )
}

export default Layout