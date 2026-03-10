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
  onboarding_foster_care_seen?: boolean
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

  useEffect(() => {
    // Initial session check — await profile before clearing loading
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes (login, signup, signout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only re-fetch profile on meaningful auth events
      // TOKEN_REFRESHED and USER_UPDATED don't need a full profile reload
      if (event === 'TOKEN_REFRESHED') return

      ;(async () => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

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
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      })

      if (reAuthError) throw new Error('Incorrect password')

      const userId = user.id

      await supabase.from('notes').delete().eq('user_id', userId)
      await supabase.from('contacts').delete().eq('user_id', userId)
      await supabase.from('court_info').delete().eq('user_id', userId)
      await supabase.from('profiles').delete().eq('id', userId)

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
    deleteAccount,
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
