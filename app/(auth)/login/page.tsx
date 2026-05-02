import Link from 'next/link'
import { signIn } from './actions'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'メールアドレスまたはパスワードが間違っています。',
  not_a_manager: 'このアカウントには管理者権限がありません。',
  unknown: 'ログインに失敗しました。時間を置いて再度お試しください。',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown) : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ログイン</h1>

      {errorMessage && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <form action={signIn} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          ログイン
        </button>
      </form>

      <div className="text-center text-sm">
        <Link href="/forgot-password" className="text-zinc-600 hover:text-zinc-900 hover:underline">
          パスワードを忘れた場合
        </Link>
      </div>
    </div>
  )
}
