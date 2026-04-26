import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TestConnectionPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const ok = !error

  return (
    <main className="p-8 font-mono space-y-4">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      <div>
        <span className="font-bold">Status: </span>
        <span className={ok ? 'text-green-600' : 'text-red-600'}>
          {ok ? 'OK' : 'NG'}
        </span>
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
        <pre className="p-4 bg-red-50 text-red-800 text-sm overflow-auto">
          {error.message}
        </pre>
      )}
    </main>
  )
}
