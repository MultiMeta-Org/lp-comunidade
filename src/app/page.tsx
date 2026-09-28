import { requireReleasedAccess } from "@/lib/guard"
import { getFeatureUnlock, getMemberFirstName, hasComunidadeVip } from "@/lib/access"
import { getLessons } from "@/lib/lessons-server"
import { SiteHeader } from "@/components/site-header"
import { LiveBanner } from "@/components/live-banner"
import { HomeBoard } from "@/components/home-board"

export const metadata = {
  title: "Portal EVP",
  description: "Tudo que é seu, num lugar só.",
}

export default async function HomePage() {
  const email = await requireReleasedAccess()
  const [unlock, name, vip, lessons] = await Promise.all([
    getFeatureUnlock(email),
    getMemberFirstName(email),
    hasComunidadeVip(email),
    getLessons(),
  ])

  return (
    <div className="min-h-screen">
      <LiveBanner />
      <SiteHeader />
      <HomeBoard
        name={name}
        // A novidade da aula leva a /dia/[id], rota da VIP: sem ela, o carrossel
        // abre nas novidades que valem para todas.
        lesson={vip ? (lessons[0] ?? null) : null}
        unlock={unlock}
        hasComunidadeVip={vip}
      />
    </div>
  )
}
