
import { Link, useLocation } from 'react-router-dom'
import { Store, CreditCard } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Store
    },
    {
      path: '/checkout',
      label: 'Checkout',
      icon: CreditCard
    }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="text-xl font-bold text-gray-900">
            Store Manager
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
