import { requireAdmin } from "@/lib/guard"
import { SiteHeader } from "@/components/site-header"
import { AdminNav } from "@/components/admin/admin-nav"
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
    // interrompido ao fechar o modal da aula (ver uploads-provider.tsx). Agora
    // também sobrevive à troca de seção do admin, pelo mesmo motivo.
    <UploadsProvider>
      <div className="min-h-screen">
        <SiteHeader wide>
          <span className="hidden lg:inline max-w-[16rem] truncate text-xs text-muted-foreground">
            {email}
          </span>
        </SiteHeader>
        <div className="max-w-5xl mx-auto px-5 pt-6">
          <AdminNav />
        </div>
        <main className="max-w-5xl mx-auto px-5 py-8 space-y-10">{children}</main>
      </div>
    </UploadsProvider>
  )
}
