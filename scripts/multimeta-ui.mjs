#!/usr/bin/env node
// Installed by @multimeta/tooling. Do not edit: it is overwritten on every sync.
//
// Checks that the files installed from the @multimeta design system
// (components/ui, lib/utils, lib/fonts...) are exactly what the registry
// shipped. They are listed with their hash in multimeta-ui.lock.json, which the
// registry's sync writes. Run in CI / prebuild:  node scripts/multimeta-ui.mjs check
//
// A failure means someone edited a design-system file by hand. Changes to those
// files go to the registry (MultiMeta-Org/multimeta-ui); the sync PR brings
// them back here. Product-only UI lives outside components/ui.
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const lockPath = path.join(root, "multimeta-ui.lock.json")
const [cmd = "check"] = process.argv.slice(2)

if (cmd !== "check") {
  console.error("usage: node scripts/multimeta-ui.mjs check")
  process.exit(2)
}
if (!existsSync(lockPath)) {
  console.error("multimeta-ui: multimeta-ui.lock.json not found (run from the project root).")
  process.exit(1)
}

const lock = JSON.parse(readFileSync(lockPath, "utf8"))
const bad = []
for (const [file, hash] of Object.entries(lock.files)) {
  const p = path.join(root, file)
  if (!existsSync(p)) bad.push(`${file}: missing`)
  else if (createHash("sha256").update(readFileSync(p)).digest("hex") !== hash) bad.push(`${file}: edited by hand`)
}

const normalize = (value) => {
  let result = ""
  let quote = ""
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (quote) {
      result += char
      if (char === "\\") result += value[++i] ?? ""
      else if (char === quote) quote = ""
    } else if (char === '"' || char === "'") {
      quote = char
      result += char
    } else if (!/\s/.test(char)) result += char
  }
  return result
}
// The installed theme uses ordinary CSS rules and Tailwind at-rules. Read just
// their paths and declarations; no package is needed in the product's CI.
const scanCss = (source) => {
  const declarations = new Map()
  const emptyRules = new Set()
  const stack = []
  let buffer = ""
  let quote = ""
  let parens = 0
  let brackets = 0
  const pathFor = (part) => [...stack, normalize(part)].join(" > ")
  const statement = () => {
    const text = buffer.trim()
    buffer = ""
    if (!text) return
    if (text.startsWith("@")) {
      emptyRules.add(pathFor(text))
      return
    }
    const match = /^([\w-]+)\s*:\s*([\s\S]*)$/.exec(text)
    if (!match) return
    const key = `${stack.join(" > ")}|${match[1]}`
    const values = declarations.get(key) ?? []
    values.push(normalize(match[2]))
    declarations.set(key, values)
  }
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (!quote && char === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2)
      if (end < 0) throw new Error("unterminated CSS comment")
      i = end + 1
    } else if (quote) {
      buffer += char
      if (char === "\\") buffer += source[++i] ?? ""
      else if (char === quote) quote = ""
    } else if (char === '"' || char === "'") {
      quote = char
      buffer += char
    } else if (char === "(") {
      parens++
      buffer += char
    } else if (char === ")") {
      parens--
      buffer += char
    } else if (char === "[") {
      brackets++
      buffer += char
    } else if (char === "]") {
      brackets--
      buffer += char
    } else if (parens === 0 && brackets === 0 && char === "{") {
      stack.push(normalize(buffer.trim()))
      buffer = ""
    } else if (parens === 0 && brackets === 0 && char === ";") statement()
    else if (parens === 0 && brackets === 0 && char === "}") {
      statement()
      if (!stack.length) throw new Error("unexpected CSS closing brace")
      stack.pop()
    } else buffer += char
  }
  if (stack.length || quote || parens || brackets) throw new Error("unterminated CSS rule")
  return { declarations, emptyRules }
}

if (lock.items.includes("theme")) {
  if (!lock.theme) bad.push("theme: no CSS manifest in the lock (run the registry sync again)")
  else {
    const cssPath = path.join(root, lock.theme.css)
    if (!existsSync(cssPath)) bad.push(`${lock.theme.css}: missing`)
    else {
      try {
        const { declarations, emptyRules } = scanCss(readFileSync(cssPath, "utf8"))
        for (const rule of lock.theme.rules) {
          if (rule.empty) {
            if (!emptyRules.has(rule.path)) bad.push(`${lock.theme.css}: ${rule.path} missing`)
            continue
          }
          const values = declarations.get(`${rule.path}|${rule.prop}`) ?? []
          const expected = normalize(rule.value)
          // Tokens must not be overridden later in product CSS. Other product
          // rules can coexist with the registry's base rules.
          const matches = rule.prop.startsWith("--") ? values.at(-1) === expected : values.includes(expected)
          if (!matches) bad.push(`${lock.theme.css}: ${rule.path} ${rule.prop} changed or missing`)
        }
      } catch (error) {
        bad.push(`${lock.theme.css}: ${error.message}`)
      }
    }
  }
}

if (bad.length) {
  console.error(`multimeta-ui: ${bad.length} design-system difference(s) from the registry (@ ${lock.commit.slice(0, 7)}):`)
  for (const b of bad) console.error(`  - ${b}`)
  console.error(
    "\nDesign-system files are owned by MultiMeta-Org/multimeta-ui. Revert the edit and make the change in the registry\n" +
      "(it opens a sync PR here), or move product-only UI to a file outside components/ui."
  )
  process.exit(1)
}
console.log(`multimeta-ui: ${Object.keys(lock.files).length} files match the registry @ ${lock.commit.slice(0, 7)} (${lock.items.length} items).`)
