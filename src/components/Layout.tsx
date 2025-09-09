import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Target, LogOut, User } from 'lucide-react'
import { signOut } from '../lib/supabase'
import { useAuthStore } from '../lib/auth-store'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const menuItems = [
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

  return (
    <div className="min-h-screen bg-[#f1f3ef] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#16c64f] shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-green-400">
          <h1 className="text-white text-xl font-bold">Finança Fácil</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
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
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-2 text-white hover:bg-green-500 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout