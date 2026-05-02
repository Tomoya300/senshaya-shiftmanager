import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TestConnectionPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const ok = !error

  return (
    <main className="space-y-4 p-8 font-mono">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      <div>
        <span className="font-bold">Status: </span>
        <span className={ok ? 'text-green-600' : 'text-red-600'}>{ok ? 'OK' : 'NG'}</span>
      </div>
      <div>
        <span className="font-bold">URL: </span>
        {url ?? '(unset)'}
      </div>
      <div>
        <span className="font-bold">Session: </span>
        {data.session ? 'present' : 'none (expected — no user yet)'}
      </div>
      {error && (
        <pre className="overflow-auto bg-red-50 p-4 text-sm text-red-800">{error.message}</pre>
      )}
    </main>
  )
}
