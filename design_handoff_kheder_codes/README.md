# Handoff: kheder.codes — Terminal-Portfolio (Astro)

## Overview
Komplett neues, minimalistisches Portfolio für kheder.codes — freiberuflicher Softwareentwickler aus Nürnberg. Die Seite imitiert das macOS Terminal: Ein Hero tippt das Logo ein, danach öffnet ein simuliertes Terminal-Fenster das „Programm" `kheder`, dessen Menü-Optionen die Unterseiten sind. Light/Dark folgt dem System-Theme des Besuchers.

## About the Design Files
Die Dateien in diesem Bundle sind **Design-Referenzen in HTML** — ein Prototyp, der Look und Verhalten zeigt, KEIN Produktionscode. Aufgabe: Diese Designs als **Astro-Anwendung** neu implementieren (Astro ist vom Auftraggeber explizit gewünscht), mit echten Routen pro Unterseite (SEO!), Astro Islands für die interaktiven Terminal-Teile und statischem Rendering für Inhalte.

- `kheder.codes.dc.html` — der Prototyp (eine Datei, alle Screens). Die Datei enthält ein HTML-Template (im `<x-dc>`-Tag) plus eine JS-Klasse mit der kompletten State-Machine — beide direkt als Referenz lesbar. Runtime-Hilfsdatei `support.js` ist NICHT Teil des Designs.
- `assets/logo.png` — Logo (schwarz auf transparent, 1748×1240). Im Dark Mode per `filter: invert(1)` invertieren.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Copy und Interaktionen sind final und sollen pixelgenau übernommen werden.

## Architektur-Empfehlung (Astro)
- Echte Routen: `/` (Hero + Terminal), `/ueber-mich`, `/blog`, `/blog/[slug]`, `/referenzen`, `/kontakt`. DonnaDesk ist ein externer Link (https://www.donnadesk.de, `target="_blank"`).
- Das Terminal-Fenster ist eine wiederverwendbare Komponente (Astro Island, z. B. Svelte/Preact/vanilla `<script>`), die auf jeder Route oben sitzt und als Navigation dient (Hybrid-Konzept: Terminal = Nav, Inhalt darunter = ruhiges, statisches Layout → crawlbar, SEO-freundlich).
- Menü-Auswahl navigiert per echtem Routing (View Transitions API / `astro:transitions` für sanfte Übergänge). Auf Unterseiten ist die zugehörige Menü-Zeile vorselektiert/markiert.
- Intro (Hero-Typing) nur auf `/`; per `sessionStorage`-Flag beim zweiten Besuch optional überspringen (Empfehlung, im Prototyp nicht enthalten).
- SEO: pro Route eigener `<title>`/`<meta description>`, Open Graph, `sitemap` + `robots` Integrationen, semantisches HTML (`<main>`, `<nav>`, `<section>`, h1/h2-Hierarchie). Inhalte NICHT hinter JS verstecken — im Prototyp sind sie clientseitig gerendert, in Astro müssen sie statisch im HTML stehen.
- Blog: Content Collections (`src/content/blog/*.md`) — die Platzhalter-Dateinamen im Prototyp sind bereits als `.md`-Slugs gedacht.

## Design Tokens

Theme via CSS Custom Properties auf `:root`, umgeschaltet mit `@media (prefers-color-scheme: dark)`:

| Token | Light | Dark |
|---|---|---|
| `--page-bg` (Seitenhintergrund) | `#f5f5f7` | `#161618` |
| `--term-bg` (Terminal/Flächen) | `#ffffff` | `#1e1f22` |
| `--fg` (Text) | `#1d1d1f` | `#e8e8ea` |
| `--dim` (Sekundärtext) | `#6e6e73` | `#98989d` |
| `--border` | `rgba(0,0,0,.12)` | `rgba(255,255,255,.14)` |
| `--chrome` / `--chrome2` (Titelleiste, Verlauf oben→unten) | `#ececf0` / `#dcdce1` | `#2c2c30` / `#242428` |
| `--row-hover` | `rgba(0,0,0,.05)` | `rgba(255,255,255,.06)` |
| `--accent` (ungesättigtes Cyan — bestätigte Wahl) | `#0e7e8a` | `#5ac8fa` |
| `--logo-filter` | `none` | `invert(1)` |
| `--shadow` (Terminal-Fenster) | `0 24px 70px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08)` | `0 24px 70px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.4)` |

Traffic Lights (fix, beide Themes): rot `#ff5f57`, gelb `#febc2e`, grün `#28c840`.
Auswahl-Highlight im Menü: `color-mix(in srgb, var(--accent) 14%, transparent)`.
Links: `color: var(--accent)`, hover: underline. `::selection`: Accent-Hintergrund, weißer Text.

### Typografie
- Mono (fast alles): `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Monaco, 'Cascadia Mono', monospace` — bewusst Systemfonts (authentischer macOS-Look, kein Webfont-Gewicht).
- Display (Wortmarke + H2): `Montserrat 800` (Google Fonts, nur Weight 800 laden), `letter-spacing: -0.02em`.
- Größen: Terminal-Body 14px / line-height 1.9; Fließtext 15px / 1.8; Sekundär 13px; Hinweise 12px; H2 `clamp(28px, 5vw, 42px)`; Hero Zeile 1 `clamp(52px, 13vw, 150px)`, Zeile 2 `clamp(26px, 6.5vw, 74px)`, line-height .95.

### Sonstige Werte
- Terminal-Fenster: max-width 840px zentriert, border-radius 12px, 1px `--border`, `--shadow`; Titelleiste 40px hoch.
- Content-Sektionen: max-width 760px zentriert, padding `56px 20px 40px`.
- Menü-Zeilen: padding `5px 12px`, border-radius 7px, negative margin `0 -12px` (Highlight läuft über die Textkante hinaus).
- Animationen: `blink` (Cursor, `1s steps(1) infinite`, 50 % an/aus), `fadeUp` (`.5s ease`, opacity 0→1 + translateY 16px→0), `fadeIn` (`.3s`).

## Screens / Views

### 1. Hero (`/`, Intro)
- Vollhöhe (100vh), zentriert, Seitenhintergrund `--page-bg`, `cursor: pointer`, `user-select: none`.
- Wortmarke wird Zeichen für Zeichen getippt (Intervall = Tipp-Speed, Standard 70 ms/Zeichen): erst „KHEDER" (Zeile 1, zentriert), dann „.codes" (Zeile 2, rechtsbündig unter der Wortmarke, `margin-top: .1em`) — entspricht dem Logo-Lockup.
- Block-Cursor (`.55em × .82em`, Hintergrund `--fg`, blinkend) hängt am jeweils zuletzt getippten Zeichen.
- Nach Abschluss erscheint (fadeUp, .8s) der Hinweis: Tastenkappe „⏎ ENTER" (1px Border, radius 6, `box-shadow: 0 2px 0 var(--border)` als 3D-Kante) + Text „drücken — oder klicken / scrollen", Farbe `--dim`, 14px, `margin-top: 56px`.

### 2. Terminal-Fenster (persistente Nav)
- macOS-Fensterchrome: Titelleiste mit Traffic Lights links (12px Kreise, gap 8), zentrierter Titel `kheder — ~ — 80×24` (13px, `--dim`); im Blog-Untermenü wechselt er zu `kheder — ~/blog — 80×24`.
- **Roter Button ist klickbar**: schließt das Fenster → zurück zur Intro-Animation (kompletter Reset inkl. erneutem Typing). Hover: `box-shadow: 0 0 0 3px rgba(255,95,87,.3)`. `title="Schließen (⎋)"`.
- Body (padding `20px 22px 24px`): Prompt-Zeile `kheder@mbp` (Accent) ` ~ %` (dim), dahinter wird `kheder` getippt (Speed + 20 ms), Block-Cursor 8×16px solange getippt wird.
- 260 ms nach dem Befehl: Programm-Output `kheder v12.0 — freiberuflicher softwareentwickler` + `wähle eine option:` (dim), dann die 5 Menü-Zeilen, gestaffelt eingeblendet (90 ms Versatz, opacity 0→1).
- Menü-Zeile: `❯` in Accent (14px Spalte) nur auf der selektierten Zeile · Name bold (min-width 118px) · Beschreibung dim 13px. Selektierte Zeile: Accent-14%-Hintergrund. Hover: `--row-hover`.
- Menüpunkte (exakte Copy):
  1. `über-mich` — Wer ich bin & womit ich arbeite
  2. `blog/` — Notizen & Artikel (öffnet Untermenü)
  3. `referenzen` — Projekte & Kunden
  4. `kontakt` — Sag hallo
  5. `donnadesk ↗` — Mein Startup — öffnet donnadesk.de (extern, neuer Tab)
- Fußzeile (12px, dim, gestrichelte Trennlinie oben): `↑↓ wählen · ⏎ öffnen · [1–5] direkt · ⎋ zurück · oder klicken`

### 3. Blog-Untermenü (Unter-Unterseiten-Muster)
- Öffnet sich im selben Terminal unter dem Hauptmenü (fadeIn); Hauptmenü dimmt auf opacity 0.4.
- Neue Prompt-Zeile: `kheder@mbp ~ % kheder blog`, darunter „3 Einträge — alle noch in Arbeit:".
- Zeilen: `❯`-Selektion wie oben · Dateiname · rechtsbündig „in Arbeit" (12px dim).
- Einträge: `voice-agents-mit-livekit.md`, `monorepos-ohne-kopfschmerzen.md`, `astro-fuer-freelancer.md`.
- Fußzeile wechselt zu: `↑↓ wählen · ⏎ öffnen · [1–3] direkt · ⎋ zurück`.

### 4. Über mich (`/ueber-mich`)
- Kicker (13px dim): `$ whoami` · H2: **Servus, ich bin Kheder.**
- Absatz 1 (15px/1.8, `--fg`): „Freiberuflicher Softwareentwickler aus Nürnberg mit **12 Jahren Erfahrung**. Ich baue Enterprise-Anwendungen, die sich nicht nach Enterprise anfühlen — vom Frontend bis zum Backend, vom Monorepo bis zum Voice Agent."
- Absatz 2 (dim): „Nebenbei baue ich mit zwei Partnern an [DonnaDesk](https://www.donnadesk.de), meinem Startup."
- 3 Chip-Gruppen (Gruppenlabel 12px uppercase dim, `letter-spacing: .08em`, Präfix `# `; Chips: 1px Border, radius 6, padding `4px 10px`, 13px, flex-wrap gap 8):
  - `# Sprachen & Frameworks`: TypeScript, C#, .NET, Angular, React, Svelte
  - `# Runtime & Tooling`: Bun, Node.js, Next.js, Astro, Monorepos
  - `# AI & Realtime`: LiveKit, Voice Agents, AI Inference

### 5. Blog (`/blog`)
- Kicker: `$ ls ./blog` · H2: **Blog**
- Je Eintrag eine Zeile: gestrichelte 1px-Border, radius 8, padding `14px 16px`, Farbe dim; Dateiname 13px links, Badge „in Arbeit" (11px, 1px Border, radius 4) rechts (`margin-left: auto`).
- Fußnote dim 13px: „Noch nichts veröffentlicht — die ersten Artikel sind in Arbeit."

### 6. Blog-Artikel (`/blog/[slug]`, Stub)
- Kicker: `$ cat ./blog/<datei>` · H2 = Artikeltitel (Voice Agents mit LiveKit / Monorepos ohne Kopfschmerzen / Astro für Freelancer).
- Text dim: „Dieser Artikel ist noch in Arbeit — schau bald wieder vorbei." + Hinweis „⎋ ESC — zurück zur Übersicht" (13px).

### 7. Referenzen (`/referenzen`)
- Kicker: `$ cat referenzen.md` · H2: **Referenzen**
- **Bewusst KEINE Cards** (Kundenfeedback): schlichte Liste, Einträge durch gestrichelte 1px-Linien getrennt, padding `22px 0`; Name bold 16px (min-width 140px) + Beschreibung dim 14px/1.7 daneben (flex-wrap, bricht mobil um).
- Einträge: **Hannover Re** „Enterprise-Anwendungen für einen der größten Rückversicherer der Welt." · **DonnaDesk ↗** (Link) „Mein Startup, mit zwei Partnern gegründet — KI-Assistenz für Teams." · **WTS** „Digitale Lösungen für Tax & Consulting." · **GIZ** „Software für internationale Zusammenarbeit."

### 8. Kontakt (`/kontakt`)
- Kicker: `$ kheder --kontakt` · H2: **Sag hallo.** · Intro dim: „Neues Projekt, Frage oder einfach nur quatschen? Schreib mir."
- Zeilen (Label dim, min-width 80px):
  - mail → `hallo@kheder.codes` (mailto)
  - github → `github.com/kamekaioken`
  - linkedin → `linkedin.com/in/marlenkheder`

### Footer (alle Seiten außer Hero)
- max-width 760px, Logo 34px hoch (`filter: var(--logo-filter)`), „© 2026 kheder.codes", rechtsbündig `exit 0`. 12px dim.

## Interactions & Behavior
- **Hero:** ⏎ / Space, Klick irgendwo, Scroll (wheel/touchmove) → Terminal-Phase. Typing wird dabei sofort abgeschlossen.
- **Hauptmenü:** ↑/↓ zyklisch, ⏎ öffnet, Ziffern 1–5 direkt, Klick öffnet ebenfalls (und setzt Selektion).
- **Untermenü Blog:** ↑/↓ zyklisch, ⏎ öffnet Artikel-Stub, Ziffern 1–3.
- **⎋ ESC — hierarchisch zurück:** Artikel → Blog-Liste/Untermenü → Hauptmenü (Seite zu) → Intro-Animation. Roter Fensterbutton = direkt zur Intro.
- Externe Links (`donnadesk`, GitHub, LinkedIn): `target="_blank" rel="noopener"`.
- Seitenwechsel scrollt sanft nach oben. Niemals `scrollIntoView` verwenden.
- Theme reagiert live auf `prefers-color-scheme`-Änderung (matchMedia-Listener).

## State Management (Prototyp-Referenz)
`phase: 'hero' | 'term'` · `heroN` (getippte Zeichen von „KHEDER.codes") · `heroDone` · `cmdN` (getippte Zeichen von „kheder") · `menuOn` · `revealN` (gestaffelte Menü-Einblendung) · `sel` (Hauptmenü-Index) · `page: null | 'about' | 'blog' | 'refs' | 'contact'` · `submenu: null | 'blog'` · `subSel` · `post: null | <datei>`. In Astro ersetzt echtes Routing `page`/`post`; Terminal-Island behält Typing-/Selektions-State.

## Assets
- `assets/logo.png` — vom Auftraggeber geliefert. Für Produktion: zusätzlich als SVG anfragen oder Favicon/OG-Image daraus ableiten.
- Keine weiteren Bilder/Icons; alle „Icons" sind Unicode-Zeichen (❯, ↗, ⏎, ⎋, ↑↓).

## Files
- `kheder.codes.dc.html` — kompletter Prototyp (Template + State-Machine)
- `assets/logo.png` — Logo

## Screenshots
In `screenshots/` (Prototyp-Captures, Cyan-Akzent):
- 01/02 Hero light/dark · 03/04 Terminal-Menü light/dark · 05 Über mich · 06 Blog-Untermenü · 07 Referenzen · 08 Kontakt
- Dark-Varianten der Unterseiten ergeben sich 1:1 aus den Tokens.
