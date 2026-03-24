# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Threshold?

A home management SaaS prototype — "The owner's manual for your home." Local prototype with no real auth/database/payments; all data is in-memory mock data. The UI is production-quality and portfolio-grade.

## Commands

```bash
npm run dev      # Dev server on http://localhost:3333
npm run build    # Production build
npm start        # Production server on port 3333
npm run lint     # ESLint (flat config, v9)
```

No test framework is configured yet.

## Architecture

**Next.js 16 App Router** with TypeScript, Tailwind CSS v4, and shadcn/ui (base-nova style).

### Key paths

- `src/app/` — App Router pages and layouts
- `src/components/ui/` — shadcn/ui primitives (button, card, dialog, etc.)
- `src/components/layout/` — App shell, sidebar, logo
- `src/components/marketing/` — Landing page (561-line single component)
- `src/data/types.ts` — All domain model interfaces (Property, Room, Appliance, Document, etc.)
- `src/data/mock-data.ts` — Rich mock data for 2 properties (~15K lines)
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `src/fonts/` — Local Fraunces variable font files

### Route structure

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/dashboard` | Property cards, stats, activity feed |
| `/property/[id]` | Property detail with tabbed navigation (Overview, Rooms, Appliances, Documents, Maintenance, Emergency, Handbook) |
| `/property/[id]/room/[roomId]` | Room detail (paint colors, fixtures, bulbs) |
| `/property/[id]/appliance/[applianceId]` | Appliance detail (specs, warranty, service history) |
| `/property/new` | Multi-step add-property wizard |
| `/handbook/[shareId]` | Published read-only tenant handbook |

### Layout hierarchy

`RootLayout` (fonts + TooltipProvider + Toaster) → `/dashboard` and `/property` routes use `AppShell` with `Sidebar`.

### Data model

The core entity is **Property**, which contains nested collections: rooms, appliances, documents, maintenanceHistory, emergencyInfo, and handbookConfig. All types are in `src/data/types.ts`. All mock instances are in `src/data/mock-data.ts`.

## Brand & Design System

- **Colors**: Defined as CSS custom properties in `globals.css`. Key tokens: Hearth (#2D2926, text), Ember (#E8734A, CTA), Clay (#C4A882, secondary), Linen (#FAF7F2, background), Stone (#8B8680, muted).
- **Fonts**: Fraunces (headings, loaded locally), Inter (body, Google Fonts), JetBrains Mono (model/serial numbers).
- **Dark mode**: Fully themed via CSS variable swaps in `globals.css`.
- **Animations**: Custom fade-in, slide-in, scale-in keyframes with staggered children in `globals.css`.

## Next.js Version Note

This project uses Next.js 16 which has breaking changes from earlier versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Import alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
