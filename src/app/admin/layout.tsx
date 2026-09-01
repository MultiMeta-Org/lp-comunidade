import { requireAdmin } from "@/lib/guard"
import { SiteHeader } from "@/components/site-header"
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
        <SiteHeader wide>
          <span className="hidden lg:inline max-w-[16rem] truncate text-xs text-muted-foreground">
            {email}
          </span>
        </SiteHeader>
        <main className="max-w-5xl mx-auto px-5 py-10 space-y-14">{children}</main>
      </div>
    </UploadsProvider>
  )
}
