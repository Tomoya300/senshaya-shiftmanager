'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=invalid_credentials')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    redirect('/login?error=invalid_credentials')
  }

  // managers テーブルに行がない（= 管理者ではない）場合はサインアウトしてリダイレクト
  const { data: manager } = await supabase
    .from('managers')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!manager) {
    await supabase.auth.signOut()
    redirect('/login?error=not_a_manager')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
