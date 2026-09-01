import { requireReleasedAccess } from "@/lib/guard"
import { getFeatureUnlock, getMemberFirstName, waitingPeriodDays } from "@/lib/access"
import { getLessons } from "@/lib/lessons-server"
import { SiteHeader } from "@/components/site-header"
import { LiveBanner } from "@/components/live-banner"
import { HubBoard } from "@/components/hub-board"

export const metadata = {
  title: "Hub da Aluna · EVP",
  description: "Tudo que você precisa, num lugar só.",
}

export default async function HubPage() {
  const email = await requireReleasedAccess()
  const [unlock, name, lessons] = await Promise.all([
    getFeatureUnlock(email),
    getMemberFirstName(email),
    getLessons(),
  ])

  return (
    <div className="min-h-screen">
      <LiveBanner />
      <SiteHeader />
      <HubBoard
        name={name}
        lesson={lessons[0] ?? null}
        lessonCount={lessons.length}
        unlock={unlock}
        waitingDays={waitingPeriodDays()}
      />
    </div>
  )
}
