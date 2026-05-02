import Link from 'next/link'
import { requestPasswordReset } from './actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams

  if (sent) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">メール送信済み</h1>
        <p className="text-sm text-zinc-700">
          パスワード再設定用のリンクをメールで送信しました。受信トレイをご確認ください。
        </p>
        <Link
          href="/login"
          className="block text-center text-sm text-zinc-600 hover:text-zinc-900 hover:underline"
        >
          ログインに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">パスワード再設定</h1>
      <p className="text-sm text-zinc-600">
        登録メールアドレスを入力してください。再設定用のリンクを送信します。
      </p>

      <form action={requestPasswordReset} className="space-y-4">
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

        <button
          type="submit"
          className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          再設定リンクを送信
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
