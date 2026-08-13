import Link from "next/link"
import { requireAdmin } from "@/lib/guard"
import { LogoutButton } from "@/components/logout-button"
import { UploadsProvider } from "@/components/admin/uploads-provider"

export const metadata = {
  title: "Admin · Portal EVP",
}

// Sempre dinâmico — depende de sessão/allowlist.
export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const email = await requireAdmin()

  return (
    // O provider fica AQUI, acima da página: o upload de vídeo não pode ser
    // interrompido ao fechar o modal da aula (ver uploads-provider.tsx).
    <UploadsProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 border-b border-border bg-card">
          <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                MultiMeta · Admin
              </span>
              <span className="text-border">·</span>
              <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary">
                Portal EVP
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/hub"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Hub
              </Link>
              <span className="hidden sm:inline text-xs text-muted-foreground">{email}</span>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-5 py-10 space-y-14">{children}</main>
      </div>
    </UploadsProvider>
  )
}
