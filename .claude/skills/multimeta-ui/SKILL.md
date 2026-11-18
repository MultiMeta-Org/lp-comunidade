---
name: multimeta-ui
description: MultiMeta design system (@multimeta shadcn registry, Petróleo light theme). Use whenever building or changing UI in a MultiMeta product (ComentAqui, Gestor Ads, and later Conta, CRM, Marketplace, VSL Builder) - picking a component, styling a screen, adding a page, form, field, button, modal, drawer, table, select/combobox, status, account switcher, toast or breadcrumb, choosing colors/fonts/radius, or installing/updating files in components/ui. Also use when asked "which component should I use", "add a dialog", "make it match the design system", or "change/update the design system".
---

# MultiMeta UI (`@multimeta`)

One look for every MultiMeta product: **Petróleo on a warm neutral base, light only**, flat surfaces, Plus Jakarta Sans for UI, Newsreader for the page title only, JetBrains Mono for ids/numbers. The source of truth is the registry `MultiMeta-Org/multimeta-ui`; Bruno approves every change there.

## The one rule: never edit design-system files in a product

`components/ui/*`, `lib/utils.ts`, `lib/fonts.ts`, `scripts/multimeta-ui.mjs` and this skill come from the registry and are listed in `multimeta-ui.lock.json`. The lock also records the shared theme CSS declarations. `node scripts/multimeta-ui.mjs check` fails if an installed file, token or shared theme rule changed; product-only CSS remains editable. To change the shared UI, open a PR in `MultiMeta-Org/multimeta-ui`; after Bruno merges it, every product gets a sync PR (`multimeta-ui/sync`). Do not run `shadcn add --overwrite` by hand in a product: the sync does it and rewrites the lock.

- Need a variant, prop or component the registry lacks? Propose it in the registry. Until then, build it in the product **outside** `components/ui` (e.g. `components/<feature>/…`) from registry parts, not by copying and editing a registry file.
- Product-only CSS goes in the product's own file or below the theme block in `globals.css`, never inside registry files.

## Install and update

Consumer `components.json` (style `radix-nova`, aliases `@/components/ui`, `@/lib/utils`):

```json
"registries": {
  "@multimeta": {
    "url": "https://multimeta-ui.vercel.app/r/{name}.json",
    "headers": { "Authorization": "Bearer ${MULTIMETA_REGISTRY_TOKEN}" }
  }
}
```

`MULTIMETA_REGISTRY_TOKEN` goes in the developer's `.env.local` only (the shadcn CLI reads it from there). Production builds never call the registry: installed files are committed.

Updates arrive as the sync PR; you normally run nothing. To **use a registry item the product does not have yet**, add it (it lands in `components/ui` and the next sync keeps it current; ask for a sync so the lock lists it, or run the sync from a `multimeta-ui` checkout: `node scripts/sync.mjs <product-root> <item>`):

```bash
npx shadcn add @multimeta/combobox
npx shadcn add @multimeta/button --diff     # see what the registry has vs this product
```

Always the `@multimeta/` prefix. A bare `shadcn add button` pulls the stock shadcn button and can re-add `@import "shadcn/tailwind.css"`, which this theme replaces. The CLI re-indents the rules it touches in `globals.css`; that whitespace diff is expected.

Items: `theme` `utils` `fonts` · `button` `input` `textarea` `label` `select` `switch` `dialog` `popover` `card` `tabs` `avatar` `sonner` `breadcrumb` · `table` `sheet` `input-group` `combobox` · `page-header` `form-primitives` `status-dot` `account-switcher` `app-shell` · `tooling` `skill` (installed by the sync).

## Which component

| Need | Use | Not |
|---|---|---|
| The app frame (sidebar, mobile drawer, scrolling main) | `AppShell` + `AppSidebar` + `AppTopBar` (`@multimeta/app-shell`) | a hand-built layout or a desktop top navbar |
| Moving between main pages | `AppSidebarNavLink` (Lucide icon) in `AppSidebarNav` | `Tabs`, buttons with `router.push` |
| The page title and its actions | `PageHeader title actions subtitle? back?` (`@multimeta/page-header`) | a custom `<h1>`, a hero banner, a title in the top bar |
| Choosing the current account (Instagram, ad account) | `AccountSwitcher` (`@multimeta/account-switcher`), `compact` in the top bar | a `Select` of accounts |
| An account in a table, card or chart | `AccountAvatar index` + `accountColour(index)` | photos, arbitrary colours |
| Any clickable action | `Button` (`@multimeta/button`) | a hand-styled `<button>` or `<a>` |
| The one main action of a view | `Button` `variant="default"` | two `default` buttons side by side |
| Secondary / cancel | `Button` `variant="outline"` | `secondary` for cancel |
| Icon or toolbar action | `Button` `variant="ghost"` `size="icon-sm"` + `aria-label` | an icon with `onClick` |
| Delete, disconnect | `Button` `variant="destructive"` inside a confirm `Dialog` | a red solid button |
| Navigation that looks like a button | `<Button asChild><Link …/></Button>` | `router.push` in `onClick` |
| A labelled form field | `Field id label info?` (`@multimeta/form-primitives`) wrapping `Input`/`Textarea`/`Select` | ad-hoc label + flex markup, placeholder as the only label |
| Help text for a field | `info` on `Field` (an `InfoTip` popover) | `title=""` tooltips, long helper paragraphs |
| Single-line text, email, number | `Input` | `Textarea` |
| A value with a prefix/suffix (R$, @, %, search icon, copy button) | `InputGroup` + `InputGroupAddon` + `InputGroupInput` | icons absolutely positioned over an `Input` |
| Multi-line text (DM message, notes) | `Textarea` | `Input` |
| One option from a short fixed list | `Select` | native `<select>` styled by hand |
| Many options with search, or several at once | `Combobox` (`@multimeta/combobox`) | a giant `Select` |
| 2-5 options shown side by side | `Segmented` (`@multimeta/form-primitives`) | `Tabs` or `Select` |
| Trigger keywords / free-text tags | `KeywordChips` (`@multimeta/form-primitives`) | a comma-separated `Input` |
| A setting that applies immediately | `ToggleRow` (label + `Switch`) | a loose `Switch`, a checkbox |
| A choice applied only on submit | checkbox | `Switch` |
| Confirm, short focused form, blocking message | `Dialog` | `window.confirm`, a stacked second dialog |
| Side panel with details or a longer form; mobile nav | `Sheet` (`@multimeta/sheet`; the nav drawer is already in `AppSidebar`) | `Dialog` |
| Small anchored panel: help, picker, account list | `Popover` | `Dialog` |
| Group content / form section on a page | `Card` (`CardHeader`/`CardTitle`/`CardAction`/`CardContent`/`CardFooter`) | shadows, glass, cards in cards |
| Records to scan and compare | `Table` inside a flat card surface | a grid of cards, a table for layout |
| State of a record ("Ativa", "Pausada", "Falhou") | `StatusDot tone` (`@multimeta/status-dot`) | filled pills/badges, colour without a word |
| Sibling views of one page | `Tabs` (`variant="line"` page level, `default` in a card) | `Tabs` to pick a form value or to switch routes |
| Person or connected account picture | `Avatar` + `AvatarFallback` initials | logos, product icons |
| Short feedback after an action | `toast.success("Salvo")` with `<Toaster />` mounted once | toasts for form errors (show them inline) |
| Trail above a nested page title | `Breadcrumb items={[{label, href}, …]}` | breadcrumbs on top-level sidebar pages |

## Component notes

- **Button**: variants `default` `outline` `secondary` `ghost` `destructive` `link`; sizes `default` (h-9) `xs` `sm` `lg` `icon` `icon-xs` `icon-sm` `icon-lg`. Icons inside get `size-4` automatically.
- **Input / Textarea**: `h-9` / auto-growing, `rounded-lg`, 16px text on phones and 14px from `md`. Errors: `aria-invalid`. Works inside plain `<form method="post">` (keep `name`).
- **Select**: `SelectTrigger size="default" | "sm"` (h-9 / h-7). Compose `Select > SelectTrigger > SelectValue` + `SelectContent > SelectItem`.
- **Switch**: `size="default" | "sm"`, Petróleo when on. In forms prefer `ToggleRow`.
- **Dialog / Sheet**: always a `DialogTitle` / `SheetTitle` (+ description). The built-in close strings are English ("Close"); pass Portuguese buttons yourself (`showCloseButton={false}` + `SheetClose`).
- **Card**: `size="default" | "sm"` (16px / 12px spacing). Titles use the UI font, never `font-title`.
- **Tabs**: `TabsList variant="default" | "line"`, horizontal or vertical.
- **Avatar**: `size="sm" | "default" | "lg"`; colored account avatars use `bg-chart-1..5` by index.
- **Sonner**: `<Toaster />` once in a layout; it is pinned to the light theme. No `next-themes`.
- **Breadcrumb**: plain `<a>` links (works without JS). Needs tag rules like `a { color: inherit }` inside `@layer base`.
- **Table**: right-align numbers with `tabular-nums`; column heads `text-xs font-medium text-muted-foreground`.
- **InputGroup**: use `InputGroupInput`/`InputGroupTextarea` inside it; addons `align="inline-start" | "inline-end" | "block-start" | "block-end"`.
- **Combobox**: Base UI (`@base-ui/react`), not Radix: `items`, `value`, `onValueChange`; `multiple` with `ComboboxChips`. Always render `ComboboxEmpty` ("Nada encontrado").
- **PageHeader**: sticky inside the scrolling `<main>` of `AppShell`; the title shrinks when pinned and `back` shows an arrow only then. The only place `font-title` is used.
- **Form primitives**: `Field`, `FieldLabel`, `InfoTip`, `ToggleRow`, `Segmented`, `KeywordChips` (+ `splitKeywords`, `addKeywords`). Strings default to Portuguese; translated apps pass `infoLabel` / `triggerLabel` / `placeholder` / `removeLabel` (ComentAqui does this in `components/campaign-form.tsx`).
- **StatusDot**: `tone="success" | "warning" | "destructive" | "primary" | "muted"` + the word as children.
- **AccountSwitcher**: controlled (`accounts`, `value`, `onValueChange`); `allValue` adds "Todas as contas"; `connectHref` adds "Conectar conta" and is the empty-state button; `onOpenChange` to refresh the list. The product owns the state (context, URL `?account=`).
- **AppShell**: `<AppShell sidebar={<AppSidebar open onOpenChange title description>{({ onNavigate }) => …}</AppSidebar>} topBar={<AppTopBar onMenuClick>…</AppTopBar>}>`. Pass `onNavigate` to brand and nav links so a tap closes the drawer; `active={isActivePath(pathname, href)}`; sign out with `AppSidebarSignOut` (MultiMeta account).

## Tokens

Colors (use the class, never the hex): `background` `foreground` `card` `popover` `primary` (+ `primary-hover`, `primary-soft`, `primary-foreground`) `secondary` `muted` / `muted-foreground` `accent` `destructive` (+ `destructive-soft`) `success` `warning` `border` `border-strong` `input` `ring` `chart-1..5`. Aliases: `surface` (= muted), `surface-hover` (= accent), `border-hover` (= border-strong), `error` (= destructive).

Type: body and table cells `text-sm`; secondary labels `text-[13px] font-medium`; column heads and captions `text-xs font-medium text-muted-foreground`; page title `font-title text-[26px] sm:text-3xl leading-tight` (via `PageHeader`).

Shape and density: controls `h-9` and `rounded-lg`; compact items `rounded-md`; cards and dialogs `rounded-xl` with `ring-1 ring-foreground/10`; icons `size-4` (lucide). Radii are Tailwind's defaults (`--radius` is 0.5rem but `--radius-*` is not remapped).

## Do / Don't

| Do | Don't |
|---|---|
| Use semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`). | Use hex values or raw palettes (`bg-slate-*`, `text-gray-*`, `bg-teal-*`, `bg-zinc-*`). |
| Keep the product light only. | Add `dark:` classes, a `.dark` class or a theme toggle. |
| Use `font-title` (Newsreader) on the page `h1` only, through `PageHeader`. | Use the serif in card titles, dialogs, tables or buttons. |
| Use `tabular-nums` and right-align metrics, counts and R$ values. | Show numbers in proportional figures. |
| Keep fields at 16px on phones (the components already do). | Force plain `text-sm` on inputs, selects or textareas. |
| Keep surfaces flat: `bg-card` + `ring-1 ring-foreground/10` or `border-border`. | Add heavy shadows, gradients, glow or glass. |
| Get updates from the sync PR; add a missing item with `npx shadcn add @multimeta/<item>`. | Edit files in `components/ui/` by hand (the check fails). Propose the change in `multimeta-ui` (Bruno approves). |
| Translate or adapt a composite by wrapping it and passing its label props. | Fork a composite's markup in the product. |
| Pass `className` for layout tweaks (margin, width). | Use `className` to recolor or restyle a component's variants. |
| Put tag rules (`a`, `body`, `h1`) in `@layer base`. | Leave unlayered tag rules that override utilities. |
| Keep product-only CSS (landing, sponsor blocks) in the product's own CSS. | Add product-specific tokens to the shared theme. |
