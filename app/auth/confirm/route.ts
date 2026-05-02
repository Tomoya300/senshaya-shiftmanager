import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase メールリンク (パスワードリセット等) のコールバック。
 * token_hash と type を verifyOtp に渡してセッションを確立し、next で指定された
 * 経路にリダイレクトする。
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/login?error=auth_link_invalid', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_link_invalid', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
