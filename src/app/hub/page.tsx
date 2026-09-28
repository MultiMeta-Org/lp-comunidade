import { redirect } from "next/navigation"

/** O Hub virou a home do portal — mantido só para não quebrar link antigo. */
export default function HubPage() {
  redirect("/")
}
