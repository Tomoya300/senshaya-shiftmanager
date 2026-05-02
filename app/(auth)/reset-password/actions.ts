'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '')

  if (password.length < 6) {
    redirect('/reset-password?error=weak_password')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=unknown')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
