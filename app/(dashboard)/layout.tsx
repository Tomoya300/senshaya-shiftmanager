import { requireManager } from '@/lib/auth/manager'
import { signOut } from '@/lib/auth/actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const manager = await requireManager()

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <div className="text-sm font-semibold">Senshaya Shift Manager</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-700">
            {manager.name}
            <span className="ml-2 text-xs text-zinc-500">
              ({manager.role === 'manager' ? 'マネージャー' : 'アシスタント'})
            </span>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
