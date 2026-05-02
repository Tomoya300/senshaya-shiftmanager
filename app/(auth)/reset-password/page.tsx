import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePassword } from './actions'

const ERROR_MESSAGES: Record<string, string> = {
  weak_password: 'パスワードは6文字以上で入力してください。',
  unknown: 'パスワードの更新に失敗しました。もう一度お試しください。',
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // /auth/confirm 経由で一時セッションが作成されている前提。
  // セッションがなければ /login へ。
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown) : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新しいパスワード</h1>
      <p className="text-sm text-zinc-600">新しいパスワードを設定してください。</p>

      {errorMessage && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <form action={updatePassword} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            新しいパスワード（6文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          パスワードを更新
        </button>
      </form>

      <div className="text-center text-sm">
        <Link href="/login" className="text-zinc-600 hover:text-zinc-900 hover:underline">
          ログインに戻る
        </Link>
      </div>
    </div>
  )
}
