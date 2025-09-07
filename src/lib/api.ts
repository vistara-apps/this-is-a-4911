import { supabase } from './supabase'
import type { PolicyModule, QuizAttempt, Policy, User } from '../context/AppContext'

// Policy and Module API
export const getPolicies = async (): Promise<Policy[]> => {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return data.map(policy => ({
      policyId: policy.policy_id,
      title: policy.title,
      content: policy.content,
      category: policy.category,
      summary: policy.summary,
    }))
  } catch (error) {
    console.error('Error fetching policies:', error)
    throw error
  }
}

export const getPolicyModules = async (): Promise<PolicyModule[]> => {
  try {
    const { data, error } = await supabase
      .from('policy_modules')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return data.map(module => ({
      moduleId: module.module_id,
      policyId: module.policy_id,
      title: module.title,
      type: module.type,
      questions: module.questions || [],
      description: module.description || '',
      points: module.points || 0,
    }))
  } catch (error) {
    console.error('Error fetching policy modules:', error)
    throw error
  }
}

export const getModuleById = async (moduleId: string): Promise<PolicyModule | null> => {
  try {
    const { data, error } = await supabase
      .from('policy_modules')
      .select('*')
      .eq('module_id', moduleId)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      moduleId: data.module_id,
      policyId: data.policy_id,
      title: data.title,
      type: data.type,
      questions: data.questions || [],
      description: data.description || '',
      points: data.points || 0,
    }
  } catch (error) {
    console.error('Error fetching module:', error)
    throw error
  }
}

// Quiz Attempts API
export const submitQuizAttempt = async (attempt: Omit<QuizAttempt, 'attemptId'>): Promise<QuizAttempt> => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: attempt.userId,
        module_id: attempt.moduleId,
        score: attempt.score,
        completion_date: attempt.completionDate,
        answers: attempt.answers,
      })
      .select()
      .single()

    if (error) throw error

    // Award badges based on score
    await awardBadges(attempt.userId, attempt.score)

    return {
      attemptId: data.attempt_id,
      userId: data.user_id,
      moduleId: data.module_id,
      score: data.score,
      completionDate: data.completion_date,
      answers: data.answers,
    }
  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    throw error
  }
}

export const getUserQuizAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completion_date', { ascending: false })

    if (error) throw error

    return data.map(attempt => ({
      attemptId: attempt.attempt_id,
      userId: attempt.user_id,
      moduleId: attempt.module_id,
      score: attempt.score,
      completionDate: attempt.completion_date,
      answers: attempt.answers,
    }))
  } catch (error) {
    console.error('Error fetching user quiz attempts:', error)
    throw error
  }
}

export const getCompanyQuizAttempts = async (companyId: string): Promise<QuizAttempt[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users!inner(company_id)
      `)
      .eq('users.company_id', companyId)
      .order('completion_date', { ascending: false })

    if (error) throw error

    return data.map(attempt => ({
      attemptId: attempt.attempt_id,
      userId: attempt.user_id,
      moduleId: attempt.module_id,
      score: attempt.score,
      completionDate: attempt.completion_date,
      answers: attempt.answers,
    }))
  } catch (error) {
    console.error('Error fetching company quiz attempts:', error)
    throw error
  }
}

// Badge System API
export const awardBadges = async (userId: string, score: number): Promise<void> => {
  try {
    const badges = []
    
    if (score >= 90) {
      badges.push('gold')
    } else if (score >= 80) {
      badges.push('silver')
    } else if (score >= 70) {
      badges.push('bronze')
    }

    for (const badgeType of badges) {
      // Insert badge if it doesn't exist (ON CONFLICT DO NOTHING equivalent)
      await supabase
        .from('user_badges')
        .upsert({
          user_id: userId,
          badge_type: badgeType,
        }, {
          onConflict: 'user_id,badge_type',
          ignoreDuplicates: true,
        })
    }
  } catch (error) {
    console.error('Error awarding badges:', error)
    // Don't throw error for badges as it's not critical
  }
}

export const getUserBadges = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_type')
      .eq('user_id', userId)

    if (error) throw error

    return data.map(badge => badge.badge_type)
  } catch (error) {
    console.error('Error fetching user badges:', error)
    return []
  }
}

// Company and User Management API
export const getCompanyUsers = async (companyId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return data.map(user => ({
      userId: user.user_id,
      companyId: user.company_id,
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingProgress: user.onboarding_progress,
    }))
  } catch (error) {
    console.error('Error fetching company users:', error)
    throw error
  }
}

export const updateCompanySubscription = async (companyId: string, tier: 'free' | 'paid', stripeCustomerId?: string): Promise<void> => {
  try {
    const updateData: any = { subscription_tier: tier }
    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId
    }

    const { error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('company_id', companyId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating company subscription:', error)
    throw error
  }
}

export const getCompany = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (error) throw error

    return {
      companyId: data.company_id,
      name: data.name,
      subscriptionTier: data.subscription_tier,
      stripeCustomerId: data.stripe_customer_id,
    }
  } catch (error) {
    console.error('Error fetching company:', error)
    throw error
  }
}

// Invitation API
export const getPendingInvitations = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_invitations')
      .select(`
        *,
        invited_by_user:users!user_invitations_invited_by_fkey(name)
      `)
      .eq('company_id', companyId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(invitation => ({
      invitationId: invitation.invitation_id,
      email: invitation.email,
      invitedBy: invitation.invited_by_user?.name || 'Unknown',
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    }))
  } catch (error) {
    console.error('Error fetching pending invitations:', error)
    throw error
  }
}

// Analytics API
export const getCompanyAnalytics = async (companyId: string) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    if (usersError) throw usersError

    // Get completed modules count
    const { data: completedModules, error: modulesError } = await supabase
      .from('quiz_attempts')
      .select(`
        user_id,
        users!inner(company_id)
      `)
      .eq('users.company_id', companyId)
      .gte('score', 70) // Passing score

    if (modulesError) throw modulesError

    // Get average scores
    const { data: avgScores, error: scoresError } = await supabase
      .rpc('get_company_avg_scores', { company_id: companyId })

    if (scoresError) {
      console.warn('Could not fetch average scores:', scoresError)
    }

    // Calculate completion rate
    const { data: allModules, error: allModulesError } = await supabase
      .from('policy_modules')
      .select('module_id')

    if (allModulesError) throw allModulesError

    const totalModules = allModules.length
    const completionRate = totalUsers && totalModules 
      ? (completedModules.length / (totalUsers * totalModules)) * 100 
      : 0

    return {
      totalUsers: totalUsers || 0,
      completedModules: completedModules.length,
      averageScore: avgScores?.[0]?.avg_score || 0,
      completionRate: Math.round(completionRate),
    }
  } catch (error) {
    console.error('Error fetching company analytics:', error)
    throw error
  }
}
