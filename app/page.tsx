import { redirect } from 'next/navigation'

// proxy.ts でも / は /dashboard or /login にリダイレクトされるが、
// 直接アクセス時のフォールバックとして用意。
export default function RootPage() {
  redirect('/login')
}
