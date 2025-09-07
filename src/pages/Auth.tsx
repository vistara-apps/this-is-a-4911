import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Mail, Lock, User, Building } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { signIn, signUp, acceptInvitation } from '../lib/auth'
import { useApp } from '../context/AppContext'

interface FormData {
  email: string
  password: string
  name: string
  companyName: string
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { dispatch } = useApp()
  
  const invitationId = searchParams.get('invitation')
  const isInvitation = !!invitationId

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    companyName: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let user
      
      if (isInvitation && invitationId) {
        // Handle invitation acceptance
        user = await acceptInvitation(invitationId, {
          name: formData.name,
          password: formData.password,
        })
      } else if (isSignUp) {
        // Handle sign up
        user = await signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          companyName: formData.companyName,
          role: 'admin',
        })
      } else {
        // Handle sign in
        user = await signIn({
          email: formData.email,
          password: formData.password,
        })
      }

      // Update app context
      dispatch({
        type: 'SET_USER',
        payload: {
          userId: user.id,
          companyId: user.companyId,
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingProgress: user.onboardingProgress,
        }
      })

      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    if (isInvitation) return 'Accept Invitation'
    return isSignUp ? 'Create Account' : 'Sign In'
  }

  const getSubtitle = () => {
    if (isInvitation) return 'Complete your profile to join your team'
    return isSignUp 
      ? 'Start your compliance training journey' 
      : 'Welcome back to OnboardWise'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-accent flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">OnboardWise</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{getTitle()}</h1>
          <p className="text-purple-100">{getSubtitle()}</p>
        </div>

        {/* Auth Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email field (hidden for invitations) */}
            {!isInvitation && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Name field (for sign up and invitations) */}
            {(isSignUp || isInvitation) && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Company name field (for sign up only) */}
            {isSignUp && !isInvitation && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : getTitle()}
            </Button>

            {/* Toggle between sign in/up (not for invitations) */}
            {!isInvitation && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            )}
          </form>
        </Card>

        {/* Back to landing */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-purple-100 hover:text-white text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
