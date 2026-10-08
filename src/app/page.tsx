import { requireReleasedAccess } from "@/lib/guard"
import {
  getFeatureUnlock,
  getMemberFirstName,
  hasDesafio,
  hasLab,
} from "@/lib/access"
import { getLessons } from "@/lib/lessons-server"
import { getBanners } from "@/lib/banners-server"
import { SiteHeader } from "@/components/site-header"
import { LiveBanner } from "@/components/live-banner"
import { HomeBoard } from "@/components/home-board"

export const metadata = {
  title: "Portal EVP",
  description: "Tudo que é seu, num lugar só.",
}

export default async function HomePage() {
  const email = await requireReleasedAccess()
  const [unlock, name, lab, desafio, banners] = await Promise.all([
    getFeatureUnlock(email),
    getMemberFirstName(email),
    hasLab(email),
    hasDesafio(email),
    getBanners(),
  ])

  // A novidade da aula sai do que ESTA aluna pode abrir: o acervo inteiro para
  // quem assina o Laboratório, só o Plantão Tira Dúvidas para as demais.
  const lessons = await getLessons(lab ? "lab" : "aberto")

  return (
    <div className="min-h-screen">
      <LiveBanner />
      <SiteHeader />
      <HomeBoard
        name={name}
        lesson={lessons[0] ?? null}
        banners={banners}
        unlock={unlock}
        hasLab={lab}
        hasDesafio={desafio}
        temPlantao={lessons.length > 0}
      />
    </div>
  )
}
