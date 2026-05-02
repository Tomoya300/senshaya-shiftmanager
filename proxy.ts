import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // _next/static, _next/image, 静的アセット (画像ファイルなど) は除外。
    // それ以外の全ルートで session を同期し、保護ルートのリダイレクトを行う。
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
