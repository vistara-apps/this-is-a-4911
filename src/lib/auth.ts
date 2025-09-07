import { supabase } from './supabase'
import type { User } from '../context/AppContext'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'employee'
  companyId: string
  onboardingProgress: number
}

export interface SignUpData {
  email: string
  password: string
  name: string
  companyName: string
  role?: 'admin' | 'employee'
}

export interface SignInData {
  email: string
  password: string
}

export interface InviteUserData {
  email: string
  name: string
  companyId: string
  invitedBy: string
}

// Authentication functions
export const signUp = async (data: SignUpData): Promise<AuthUser> => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create company if admin
    let companyId: string
    if (data.role === 'admin' || !data.role) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.companyName,
          subscription_tier: 'free',
        })
        .select()
        .single()

      if (companyError) throw companyError
      companyId = companyData.company_id
    } else {
      // For employees, companyId should be provided separately
      throw new Error('Company ID required for employee signup')
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        company_id: companyId,
        email: data.email,
        name: data.name,
        role: data.role || 'admin',
        onboarding_progress: 0,
      })
      .select()
      .single()

    if (userError) throw userError

    return {
      id: userData.user_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      companyId: userData.company_id,
      onboardingProgress: userData.onboarding_progress,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export const signIn = async (data: SignInData): Promise<AuthUser> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to sign in')

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (userError) throw userError

    return {
      id: userData.user_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      companyId: userData.company_id,
      onboardingProgress: userData.onboarding_progress,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) throw authError
    if (!user) return null

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (userError) {
      console.error('User profile not found:', userError)
      return null
    }

    return {
      id: userData.user_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      companyId: userData.company_id,
      onboardingProgress: userData.onboarding_progress,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const inviteUser = async (data: InviteUserData): Promise<void> => {
  try {
    // Create invitation record
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const { error: inviteError } = await supabase
      .from('user_invitations')
      .insert({
        company_id: data.companyId,
        email: data.email,
        invited_by: data.invitedBy,
        expires_at: expiresAt.toISOString(),
      })

    if (inviteError) throw inviteError

    // In a real app, you would send an email here
    console.log(`Invitation sent to ${data.email}`)
  } catch (error) {
    console.error('Invite user error:', error)
    throw error
  }
}

export const acceptInvitation = async (invitationId: string, userData: { name: string; password: string }): Promise<AuthUser> => {
  try {
    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_id', invitationId)
      .eq('status', 'pending')
      .single()

    if (inviteError) throw inviteError
    if (!invitation) throw new Error('Invalid or expired invitation')

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create user profile
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        company_id: invitation.company_id,
        email: invitation.email,
        name: userData.name,
        role: 'employee',
        onboarding_progress: 0,
      })
      .select()
      .single()

    if (userError) throw userError

    // Update invitation status
    await supabase
      .from('user_invitations')
      .update({ status: 'accepted' })
      .eq('invitation_id', invitationId)

    return {
      id: newUser.user_id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      companyId: newUser.company_id,
      onboardingProgress: newUser.onboarding_progress,
    }
  } catch (error) {
    console.error('Accept invitation error:', error)
    throw error
  }
}

export const updateUserProgress = async (userId: string, progress: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ onboarding_progress: progress })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Update user progress error:', error)
    throw error
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const user = await getCurrentUser()
      callback(user)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}
