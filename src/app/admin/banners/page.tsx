import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { bannerNoAr, resolveBannerImage } from "@/lib/banners-server"
import { buildHighlights } from "@/lib/home"
import { BannersManager, type BannerRow } from "@/components/admin/banners-manager"

export const metadata = { title: "Banners · Admin" }

/** timestamptz → "AAAA-MM-DD" no fuso de São Paulo (formato do <input date>). */
function dataLocal(iso: string | null): string {
  if (!iso) return ""
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso))
}

export default async function AdminBannersPage() {
  const db = createComunidadeServiceClient()

  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  const agora = new Date()
  const rows: BannerRow[] = (data ?? []).map((b) => {
    const janela = { startsAt: b.starts_at, endsAt: b.ends_at }
    const noAr = b.active && bannerNoAr(janela, agora)
    return {
      id: b.id,
      label: b.label,
      // O ref cru volta no formulário (senão salvar converteria o arquivo do
      // Storage numa URL pública fixa); o resolvido só serve para a miniatura.
      imageRef: b.image_url,
      imagePreview: resolveBannerImage(db, b.image_url) ?? "",
      imageMobileRef: b.image_mobile_url ?? "",
      imageMobilePreview: resolveBannerImage(db, b.image_mobile_url) ?? "",
      href: b.href,
      cta: b.cta,
      alt: b.alt,
      active: b.active,
      startsOn: dataLocal(b.starts_at),
      endsOn: dataLocal(b.ends_at),
      estado: noAr
        ? "no-ar"
        : !b.active
          ? "desligado"
          : b.starts_at && new Date(b.starts_at) > agora
            ? "agendado"
            : "expirado",
    }
  })

  // Quantos slides fixos existem no código — é a redundância que a Nati precisa
  // saber que está lá, mesmo sem nenhum banner cadastrado.
  const fixos = buildHighlights(null).length

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Banners</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          O carrossel do topo da home. Banner é imagem e botão — sem título nem
          texto corrido, porque a arte já diz o que precisa. Os seus aparecem
          primeiro, na ordem daqui; depois deles vêm sempre os {fixos} slides
          fixos do código, que ninguém precisa manter e garantem que a home nunca
          fique vazia.
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive">
          Erro ao carregar os banners: {error.message}
        </p>
      )}

      <BannersManager rows={rows} />
    </section>
  )
}
