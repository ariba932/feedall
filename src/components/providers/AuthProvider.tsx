import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
          router.refresh()
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    getUser()
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
