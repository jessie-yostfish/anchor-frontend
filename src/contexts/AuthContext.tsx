import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  first_name?: string
  username?: string
  role?: string
  current_stage?: string
  language?: string
  children_status?: string
  has_lawyer?: boolean
  lawyer_name?: string
  lawyer_phone?: string
  has_case_manager?: boolean
  case_manager_name?: string
  case_manager_phone?: string
  court_history?: string
  next_court_date?: string
  primary_concerns?: string
  text_reminders_enabled?: boolean
  phone_number?: string
  intake_completed?: boolean
  intake_step?: number
  created_at?: string
  updated_at?: string
}

interface SignUpData {
  email: string
  password: string
  metadata?: {
    username?: string
    first_name?: string
    role?: string
  }
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
deleteAccount: (password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (data: SignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: data.metadata || {},
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
  const deleteAccount = async (password: string) => {
    if (!user) return { error: new Error('No user logged in') }
    
    try {
      // Re-authenticate first
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      })
      
      if (reAuthError) throw new Error('Incorrect password')

      // Delete user data from all tables
      const userId = user.id
      
      await supabase.from('notes').delete().eq('user_id', userId)
      await supabase.from('contacts').delete().eq('user_id', userId)
      await supabase.from('court_info').delete().eq('user_id', userId)
      await supabase.from('profiles').delete().eq('id', userId)
      
      // Delete auth user
      const { error: deleteError } = await supabase.rpc('delete_user')
      
      if (deleteError) throw deleteError

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteAccount
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
