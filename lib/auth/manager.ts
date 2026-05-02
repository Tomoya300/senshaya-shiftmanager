import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Manager = {
  id: string
  email: string
  name: string
  role: 'manager' | 'assistant'
}

/**
 * 認証済みかつ public.managers に行があるユーザー（マネージャー）を返す。
 * - 未ログイン: /login へリダイレクト
 * - ログイン済みだが managers に行なし: signOut して /login?error=not_a_manager へ
 *
 * Server Components / Server Actions / Route Handlers から呼ぶ。
 */
export async function requireManager(): Promise<Manager> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: manager, error } = await supabase
    .from('managers')
    .select('id, email, name, role')
    .eq('id', user.id)
    .single<Manager>()

  if (error || !manager) {
    await supabase.auth.signOut()
    redirect('/login?error=not_a_manager')
  }

  return manager
}
