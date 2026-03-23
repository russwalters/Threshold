# Threshold — Build Spec

> "The owner's manual for your home."
> Campaign: "Stop Googling your own house."

Build a fully functional prototype of Threshold, a home management platform. This is a LOCAL prototype — no real auth, no real database, no payment processing. Use in-memory/JSON mock data. But the UI should be PRODUCTION QUALITY — beautiful, polished, fully interactive.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- React Hook Form + Zod for forms
- In-memory mock data (JSON files in /data)
- Local file system for "uploads" (just reference paths)

## Brand Identity

### Colors (Tailwind config)
- Hearth (primary text): #2D2926
- Ember (primary action/CTA): #E8734A  
- Clay (secondary): #C4A882
- Linen (background): #FAF7F2
- Stone (muted text): #8B8680
- Sage (success): #7A9E7E
- Slate (info): #5B7B8F
- Brass (premium): #C9A227
- Alert: #D64545
- Caution: #E5A911
- Good: #4A9E6B

### Typography
- Headings: Fraunces (Google Fonts, serif with character)
- Body: Inter (Google Fonts)
- Mono: JetBrains Mono (for model numbers, serial numbers)

### Logo
Text wordmark: "threshold" in Fraunces, lowercase. The "t" and "h" should feel like a doorway.

## Pages to Build

### 1. Marketing Landing Page (`/`)
Beautiful, conversion-focused landing page:
- Hero: "The owner's manual for your home" headline, "Stop Googling your own house" subhead
- Problem section: Split view showing landlord pain vs homeowner pain
- Feature showcase with icons and illustrations
- How it works (3 steps: Document → Organize → Share)
- Pricing cards (Free / Pro $9/mo / Portfolio $29/mo)
- Testimonials (use realistic mock data)
- Final CTA
- Footer with links
- Should feel like a premium SaaS landing page (think Linear/Notion quality)

### 2. Dashboard (`/dashboard`)
After "login" — the main hub:
- Property cards showing all properties
- Quick stats (total appliances, upcoming maintenance, documents stored)
- Recent activity feed
- "Add Property" CTA
- Sidebar navigation

### 3. Property Detail (`/property/[id]`)
Single property view with tab navigation:
- **Overview tab**: Property photo, key details, quick stats
- **Rooms tab**: Grid of rooms with photos, click into room detail
- **Appliances tab**: Searchable/filterable list of all appliances
- **Documents tab**: Organized document vault
- **Maintenance tab**: Schedule + history timeline
- **Emergency tab**: Emergency procedures and contacts
- **Handbook tab**: Preview of the published tenant handbook

### 4. Room Detail (`/property/[id]/room/[roomId]`)
- Room photos (gallery)
- Paint colors with color swatches
- Fixtures and features
- Appliances in this room (linked)
- Light bulb specs
- Notes and tips

### 5. Appliance Detail (`/property/[id]/appliance/[applianceId]`)
- Photos
- Brand, model, serial number
- Purchase date, warranty status (with visual indicator)
- Link to manual
- Service history timeline
- Operating tips
- "Request Service" button (mock)

### 6. Published Handbook (`/handbook/[shareId]`)
This is what TENANTS see — the beautiful, read-only handbook:
- Welcome header with property photo and address
- Table of contents
- Room-by-room guide with photos and tips
- Appliance quick reference (name, location, basic instructions)
- Emergency procedures (prominently placed)
- Utility setup guide
- House rules
- Local area recommendations
- Contact information
- Beautiful typography, warm design, feels like a welcome gift
- Should be responsive and work great on mobile
- QR code that links back to itself

### 7. Add/Edit Property Form (`/property/new`, `/property/[id]/edit`)
Multi-step wizard:
- Step 1: Basic info (address, type, beds/baths)
- Step 2: Rooms (add rooms from templates)
- Step 3: Key details (utilities, wifi, parking)
- Step 4: Emergency info
- Smooth animations between steps

## Mock Data

Create rich, realistic mock data for TWO properties:

### Property 1: "2576 Frisco Drive" (Rental)
- 2576 Frisco Dr, Clearwater, FL 33761
- Single family, 3 bed / 2 bath, built 1985, 1,800 sqft
- Rented at $3,700/mo
- 8 rooms fully documented
- 15+ appliances with model numbers, warranties, manuals
- Full emergency procedures
- Complete tenant handbook
- Maintenance history going back 2 years

### Property 2: "The Woods" (Primary Residence)  
- Jacksonville, FL 32224
- Single family, 4 bed / 3 bath, built 2024, 2,400 sqft
- Owner-occupied
- Partially documented (show progressive completion)
- 5 rooms, 8 appliances

## Design Requirements

- BEAUTIFUL. This is a portfolio piece. Every pixel matters.
- Smooth page transitions and micro-animations
- Hover effects on interactive elements
- Loading skeletons where appropriate
- Empty states with helpful illustrations/copy
- Responsive (mobile-first, looks great on tablet and desktop)
- Dark mode support (bonus but nice to have)
- Consistent spacing, alignment, typography hierarchy
- Use the warm Linen background throughout
- Cards with subtle shadows and rounded corners
- The published handbook page should feel especially premium

## Interactive Features (all with mock data)
- Add/edit/delete properties (saved to local state)
- Add/edit rooms and appliances
- Search and filter appliances
- Toggle between owner view and tenant view
- Generate and preview handbook
- Working navigation and routing
- Form validation with helpful error messages
- Toast notifications for actions

## What NOT to build
- Real authentication (just a mock login screen, auto-redirects)
- Real database (use in-memory stores / JSON)
- Real file uploads (reference placeholder images)
- Real payment processing
- Real email notifications
- Real QR code generation (use a placeholder)

## Run locally on port 3333
