import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  BarChart3, 
  Menu, 
  X, 
  User,
  Star,
  Settings,
  LogOut
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { signOut } from '../lib/auth'
import Button from './ui/Button'
import Badge from './ui/Badge'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useApp()

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!state.isLoading && !state.user) {
      navigate('/auth')
    }
  }, [state.isLoading, state.user, navigate])

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Policies', href: '/app/policies', icon: FileText },
    { name: 'Progress', href: '/app/progress', icon: BarChart3 },
  ]

  // Add admin navigation for admin users
  if (state.user?.role === 'admin') {
    navigation.splice(1, 0, { name: 'Admin', href: '/app/admin', icon: Settings })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === '/app'
    }
    return location.pathname.startsWith(href)
  }

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!state.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-surface shadow-xl">
          <div className="flex items-center justify-between p-lg border-b">
            <h2 className="text-xl font-semibold text-primary">OnboardWise</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <nav className="p-lg space-y-sm">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-surface lg:shadow-card">
        <div className="flex items-center justify-between p-lg border-b">
          <h2 className="text-xl font-semibold text-primary">OnboardWise</h2>
        </div>
        <nav className="flex-1 p-lg space-y-sm">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* User info */}
        {state.user && (
          <div className="p-lg border-t bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {state.user.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {state.user.email}
                </p>
              </div>
            </div>
            
            {/* User stats */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium">{state.totalPoints} pts</span>
              </div>
              <div className="flex space-x-1">
                {state.userBadges.map((badge) => (
                  <Badge key={badge} variant={badge as any} size="sm" />
                ))}
              </div>
            </div>
            
            {/* Sign out button */}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 lg:hidden bg-surface shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-primary">OnboardWise</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
