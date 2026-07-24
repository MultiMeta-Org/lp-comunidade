import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export const metadata = {
  title: "Entrar · Comunidade VIP EVP",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
