import { requireManager } from '@/lib/auth/manager'

export default async function DashboardPage() {
  const manager = await requireManager()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <p className="text-zinc-700">ようこそ、{manager.name} さん。</p>
      <p className="text-sm text-zinc-500">
        ここに翌日のシフト入力・従業員管理・送信プレビューへの動線が今後追加されます。
      </p>
    </div>
  )
}
