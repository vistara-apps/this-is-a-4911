import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          company_id: string
          name: string
          subscription_tier: 'free' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id?: string
          name: string
          subscription_tier?: 'free' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          name?: string
          subscription_tier?: 'free' | 'paid'
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          user_id: string
          company_id: string
          email: string
          name: string
          role: 'admin' | 'employee'
          onboarding_progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          company_id: string
          email: string
          name: string
          role?: 'admin' | 'employee'
          onboarding_progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          company_id?: string
          email?: string
          name?: string
          role?: 'admin' | 'employee'
          onboarding_progress?: number
          created_at?: string
          updated_at?: string
        }
      }
      policies: {
        Row: {
          policy_id: string
          title: string
          content: string
          category: string
          summary: string
          created_at: string
          updated_at: string
        }
        Insert: {
          policy_id?: string
          title: string
          content: string
          category: string
          summary: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          policy_id?: string
          title?: string
          content?: string
          category?: string
          summary?: string
          created_at?: string
          updated_at?: string
        }
      }
      policy_modules: {
        Row: {
          module_id: string
          policy_id: string
          title: string
          type: 'quiz' | 'reading'
          questions: any
          description: string
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          module_id?: string
          policy_id: string
          title: string
          type: 'quiz' | 'reading'
          questions: any
          description: string
          points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          module_id?: string
          policy_id?: string
          title?: string
          type?: 'quiz' | 'reading'
          questions?: any
          description?: string
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          attempt_id: string
          user_id: string
          module_id: string
          score: number
          completion_date: string
          answers: any
          created_at: string
        }
        Insert: {
          attempt_id?: string
          user_id: string
          module_id: string
          score: number
          completion_date: string
          answers: any
          created_at?: string
        }
        Update: {
          attempt_id?: string
          user_id?: string
          module_id?: string
          score?: number
          completion_date?: string
          answers?: any
          created_at?: string
        }
      }
    }
  }
}
