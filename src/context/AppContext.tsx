import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange } from '../lib/auth'
import { getPolicies, getPolicyModules, getUserQuizAttempts, getUserBadges } from '../lib/api'

// Types
export interface User {
  userId: string
  companyId: string
  email: string
  name: string
  role: 'admin' | 'employee'
  onboardingProgress: number
}

export interface PolicyModule {
  moduleId: string
  policyId: string
  title: string
  type: 'quiz' | 'reading'
  questions: Question[]
  description: string
  points: number
}

export interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false'
  options?: string[]
  correctAnswer: string | boolean
  explanation: string
}

export interface QuizAttempt {
  attemptId: string
  userId: string
  moduleId: string
  score: number
  completionDate: string
  answers: Record<string, any>
}

export interface Policy {
  policyId: string
  title: string
  content: string
  category: string
  summary: string
}

interface AppState {
  user: User | null
  modules: PolicyModule[]
  policies: Policy[]
  attempts: QuizAttempt[]
  userBadges: string[]
  totalPoints: number
  isLoading: boolean
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_MODULES'; payload: PolicyModule[] }
  | { type: 'SET_POLICIES'; payload: Policy[] }
  | { type: 'SET_ATTEMPTS'; payload: QuizAttempt[] }
  | { type: 'SET_BADGES'; payload: string[] }
  | { type: 'COMPLETE_QUIZ'; payload: QuizAttempt }
  | { type: 'ADD_BADGE'; payload: string }
  | { type: 'UPDATE_POINTS'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AppState = {
  user: null,
  modules: [],
  policies: [],
  attempts: [],
  userBadges: [],
  totalPoints: 0,
  isLoading: true
}

// Mock data
const mockModules: PolicyModule[] = [
  {
    moduleId: '1',
    policyId: 'hr-001',
    title: 'Employee Rights & Responsibilities',
    type: 'quiz',
    description: 'Learn about your basic employee rights and workplace responsibilities',
    points: 100,
    questions: [
      {
        id: '1',
        question: 'What is the minimum notice period for termination?',
        type: 'multiple-choice',
        options: ['1 week', '2 weeks', '1 month', '3 months'],
        correctAnswer: '2 weeks',
        explanation: 'Standard notice period is 2 weeks for most positions.'
      },
      {
        id: '2',
        question: 'Employees have the right to a safe working environment.',
        type: 'true-false',
        correctAnswer: true,
        explanation: 'All employees have the fundamental right to workplace safety.'
      },
      {
        id: '3',
        question: 'Which of these is considered workplace harassment?',
        type: 'multiple-choice',
        options: ['Unwanted comments', 'Excessive workload', 'Late meetings', 'Dress code'],
        correctAnswer: 'Unwanted comments',
        explanation: 'Unwanted comments, especially those based on protected characteristics, constitute harassment.'
      }
    ]
  },
  {
    moduleId: '2',
    policyId: 'hr-002',
    title: 'Anti-Discrimination & Harassment',
    type: 'quiz',
    description: 'Understanding our zero-tolerance policy on discrimination and harassment',
    points: 120,
    questions: [
      {
        id: '1',
        question: 'Discrimination based on age is legal in the workplace.',
        type: 'true-false',
        correctAnswer: false,
        explanation: 'Age discrimination is illegal and violates employment laws.'
      },
      {
        id: '2',
        question: 'What should you do if you witness harassment?',
        type: 'multiple-choice',
        options: ['Ignore it', 'Report it to HR', 'Handle it yourself', 'Wait and see'],
        correctAnswer: 'Report it to HR',
        explanation: 'All incidents should be reported to HR immediately for proper investigation.'
      }
    ]
  },
  {
    moduleId: '3',
    policyId: 'sec-001',
    title: 'Data Privacy & Security',
    type: 'quiz',
    description: 'Essential guidelines for protecting company and customer data',
    points: 90,
    questions: [
      {
        id: '1',
        question: 'Strong passwords should contain which elements?',
        type: 'multiple-choice',
        options: ['Only letters', 'Letters and numbers', 'Letters, numbers, and symbols', 'Just numbers'],
        correctAnswer: 'Letters, numbers, and symbols',
        explanation: 'Strong passwords combine uppercase, lowercase, numbers, and special characters.'
      },
      {
        id: '2',
        question: 'You can share your login credentials with trusted colleagues.',
        type: 'true-false',
        correctAnswer: false,
        explanation: 'Login credentials should never be shared with anyone, regardless of trust level.'
      }
    ]
  }
]

const mockPolicies: Policy[] = [
  {
    policyId: 'hr-001',
    title: 'Employee Handbook',
    category: 'Human Resources',
    summary: 'Comprehensive guide to employee rights, responsibilities, and company policies',
    content: 'This handbook outlines all employee rights including fair compensation, safe working conditions, non-discrimination, and due process. It also covers responsibilities such as professional conduct, confidentiality, and compliance with company policies.'
  },
  {
    policyId: 'hr-002',
    title: 'Anti-Harassment Policy',
    category: 'Human Resources',
    summary: 'Zero-tolerance policy on workplace harassment and discrimination',
    content: 'Our company maintains a zero-tolerance policy toward harassment and discrimination. This includes verbal, physical, visual, or written conduct that creates an intimidating, offensive, or hostile work environment.'
  },
  {
    policyId: 'sec-001',
    title: 'Information Security Policy',
    category: 'Security',
    summary: 'Guidelines for protecting company and customer data',
    content: 'All employees must follow security protocols including strong password policies, secure data handling, and proper use of company systems. Data breaches must be reported immediately.'
  }
]

const mockUser: User = {
  userId: 'user-1',
  companyId: 'comp-1',
  email: 'john.doe@company.com',
  name: 'John Doe',
  role: 'employee',
  onboardingProgress: 33
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false }
    case 'SET_MODULES':
      return { ...state, modules: action.payload }
    case 'SET_POLICIES':
      return { ...state, policies: action.payload }
    case 'SET_ATTEMPTS':
      return { ...state, attempts: action.payload }
    case 'SET_BADGES':
      return { ...state, userBadges: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'COMPLETE_QUIZ':
      const newAttempt = action.payload
      const newBadges = [...state.userBadges]
      let newPoints = state.totalPoints + (newAttempt.score >= 80 ? 100 : 50)
      
      // Award badges based on performance
      if (newAttempt.score >= 90 && !newBadges.includes('gold')) {
        newBadges.push('gold')
      } else if (newAttempt.score >= 80 && !newBadges.includes('silver')) {
        newBadges.push('silver')
      } else if (newAttempt.score >= 70 && !newBadges.includes('bronze')) {
        newBadges.push('bronze')
      }
      
      return {
        ...state,
        attempts: [...state.attempts, newAttempt],
        userBadges: newBadges,
        totalPoints: newPoints
      }
    case 'ADD_BADGE':
      return {
        ...state,
        userBadges: [...state.userBadges, action.payload]
      }
    case 'UPDATE_POINTS':
      return {
        ...state,
        totalPoints: state.totalPoints + action.payload
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    // Initialize authentication and data
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Check for authenticated user
        const authUser = await getCurrentUser()
        const user = authUser ? {
          userId: authUser.id,
          companyId: authUser.companyId,
          email: authUser.email,
          name: authUser.name,
          role: authUser.role,
          onboardingProgress: authUser.onboardingProgress
        } : null
        dispatch({ type: 'SET_USER', payload: user })

        // Load policies and modules (public data)
        const [policies, modules] = await Promise.all([
          getPolicies(),
          getPolicyModules()
        ])
        
        dispatch({ type: 'SET_POLICIES', payload: policies })
        dispatch({ type: 'SET_MODULES', payload: modules })

        // Load user-specific data if authenticated
        if (user) {
          const [attempts, badges] = await Promise.all([
            getUserQuizAttempts(user.userId),
            getUserBadges(user.userId)
          ])
          
          dispatch({ type: 'SET_ATTEMPTS', payload: attempts })
          dispatch({ type: 'SET_BADGES', payload: badges })
        }
      } catch (error) {
        console.error('Error initializing app:', error)
        // Fallback to mock data if API fails
        dispatch({ type: 'SET_MODULES', payload: mockModules })
        dispatch({ type: 'SET_POLICIES', payload: mockPolicies })
        dispatch({ type: 'SET_USER', payload: null })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeApp()

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      dispatch({ type: 'SET_USER', payload: user })
      
      if (user) {
        // Load user-specific data
        try {
          const [attempts, badges] = await Promise.all([
            getUserQuizAttempts(user.id),
            getUserBadges(user.id)
          ])
          
          dispatch({ type: 'SET_ATTEMPTS', payload: attempts })
          dispatch({ type: 'SET_BADGES', payload: badges })
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      } else {
        // Clear user-specific data
        dispatch({ type: 'SET_ATTEMPTS', payload: [] })
        dispatch({ type: 'SET_BADGES', payload: [] })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
