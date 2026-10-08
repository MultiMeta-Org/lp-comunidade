"use client"

import { useState } from "react"
import type { Empresa } from "@/lib/desafio-server"
import { RadarEditor } from "@/components/desafio/missao"

/**
 * O Radar fora da missão. Mesmo editor, sem meta do dia — aqui não existe
 * "hoje": a meta é a do Desafio inteiro, e adicionar é comportamento contínuo.
 */
export function RadarPagina({ inicial }: { inicial: Empresa[] }) {
  const [radar, setRadar] = useState(inicial)
  const [erro, setErro] = useState<string | null>(null)

  return (
    <>
      <RadarEditor dia={null} radar={radar} setRadar={setRadar} setErro={setErro} />
      {erro && (
        <p role="alert" className="mt-4 text-xs font-semibold text-secondary">
          {erro}
        </p>
      )}
    </>
  )
}
