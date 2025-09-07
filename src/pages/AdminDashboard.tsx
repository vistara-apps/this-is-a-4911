import React, { useState, useEffect } from 'react'
import { Users, Mail, BarChart3, Crown, Plus, Settings } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'
import { 
  getCompanyUsers, 
  getCompanyAnalytics, 
  getPendingInvitations,
  getCompany 
} from '../lib/api'
import { inviteUser } from '../lib/auth'
import { createCheckoutSession, createPortalSession, SUBSCRIPTION_PLANS } from '../lib/stripe'

interface CompanyUser {
  userId: string
  name: string
  email: string
  role: 'admin' | 'employee'
  onboardingProgress: number
}

interface Analytics {
  totalUsers: number
  completedModules: number
  averageScore: number
  completionRate: number
}

interface Invitation {
  invitationId: string
  email: string
  invitedBy: string
  expiresAt: string
  createdAt: string
}

interface Company {
  companyId: string
  name: string
  subscriptionTier: 'free' | 'paid'
  stripeCustomerId?: string
}

export default function AdminDashboard() {
  const { state } = useApp()
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (state.user?.companyId) {
      loadData()
    }
  }, [state.user?.companyId])

  const loadData = async () => {
    if (!state.user?.companyId) return

    try {
      setIsLoading(true)
      const [usersData, analyticsData, invitationsData, companyData] = await Promise.all([
        getCompanyUsers(state.user.companyId),
        getCompanyAnalytics(state.user.companyId),
        getPendingInvitations(state.user.companyId),
        getCompany(state.user.companyId),
      ])

      setUsers(usersData)
      setAnalytics(analyticsData)
      setInvitations(invitationsData)
      setCompany(companyData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.user?.companyId || !state.user?.userId) return

    try {
      setIsInviting(true)
      await inviteUser({
        email: inviteEmail,
        name: '', // Will be filled by the invitee
        companyId: state.user.companyId,
        invitedBy: state.user.userId,
      })
      
      setInviteEmail('')
      setShowInviteModal(false)
      await loadData() // Refresh data
    } catch (error: any) {
      console.error('Error inviting user:', error)
      alert(error.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpgrade = async () => {
    if (!company?.companyId) return

    try {
      await createCheckoutSession('paid', company.companyId)
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start upgrade process')
    }
  }

  const handleManageSubscription = async () => {
    if (!company?.stripeCustomerId) return

    try {
      await createPortalSession(company.stripeCustomerId)
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Failed to open subscription management')
    }
  }

  const canInviteMoreUsers = () => {
    if (company?.subscriptionTier === 'paid') return true
    return users.length < SUBSCRIPTION_PLANS.FREE.maxUsers
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your team's compliance training</p>
        </div>
        <div className="flex items-center space-x-4">
          {company?.subscriptionTier === 'free' && (
            <Button onClick={handleUpgrade} className="bg-accent hover:bg-accent/90">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}
          {company?.subscriptionTier === 'paid' && company?.stripeCustomerId && (
            <Button 
              variant="outline" 
              onClick={handleManageSubscription}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </div>
      </div>

      {/* Subscription Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {company?.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={company?.subscriptionTier === 'paid' ? 'gold' : 'bronze'}>
                {SUBSCRIPTION_PLANS[company?.subscriptionTier?.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]?.name || 'Free'}
              </Badge>
              <span className="text-sm text-gray-600">
                {company?.subscriptionTier === 'free' 
                  ? `${users.length}/${SUBSCRIPTION_PLANS.FREE.maxUsers} users`
                  : 'Unlimited users'
                }
              </span>
            </div>
          </div>
          {company?.subscriptionTier === 'free' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Upgrade for unlimited users</p>
              <p className="text-lg font-semibold text-primary">
                ${SUBSCRIPTION_PLANS.PAID.price}/month
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageScore)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Modules</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completedModules}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <Button
              onClick={() => setShowInviteModal(true)}
              disabled={!canInviteMoreUsers()}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.userId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'gold' : 'bronze'}>
                      {user.role}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {user.onboardingProgress}% complete
                    </span>
                  </div>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${user.onboardingProgress}%` }}
                  />
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No team members yet</p>
                <p className="text-sm text-gray-500">Invite your first team member to get started</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pending Invitations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Invitations</h3>
          
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.invitationId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{invitation.email}</p>
                  <p className="text-sm text-gray-600">
                    Invited by {invitation.invitedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="bronze">Pending</Badge>
              </div>
            ))}

            {invitations.length === 0 && (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending invitations</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            
            <form onSubmit={handleInviteUser}>
              <div className="mb-4">
                <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isInviting}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
