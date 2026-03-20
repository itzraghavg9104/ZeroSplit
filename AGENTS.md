# AGENTS.md

## Mission
ZeroSplit is a mobile-first expense-sharing PWA. Keep auth, group membership, expense math, and real-time Firestore behavior intact when making changes.

## Stack
- Next.js 16 App Router
- React 19 + TypeScript
- Firebase Auth + Firestore
- Tailwind CSS 4 plus many page-local inline `style` objects
- Cloudinary uploads via `src/utils/upload.ts`
- GSAP-backed `DotGrid`
- `next-pwa` for install/offline support

## Commands
- `npm run dev`
- `npm run lint`

There is no automated test suite in this repo right now, so lint plus manual flow checks are the main verification path.

## Architecture Map
- `src/app/layout.tsx`: global metadata, `ThemeProvider`, `AuthProvider`, analytics.
- `src/app/(app)/layout.tsx`: client-side route gate for auth, email verification, and onboarding completeness.
- `src/contexts/AuthContext.tsx`: auth/session source of truth. It also creates fallback local user data when Firestore is unavailable.
- `src/contexts/ThemeContext.tsx`: theme persistence and `dark` class toggling.
- `src/lib/firebase.ts`: Firestore initialization with persistent local cache and multi-tab support.
- `src/app/(app)/*`: most product pages are client components that query and mutate Firestore directly.
- `src/components/ui/*`: reusable primitives plus modal-heavy UI.
- `src/utils/activity.ts`, `src/utils/settlements.ts`, and `src/lib/algorithms.ts`: shared business logic.

## Firestore Collections And Invariants
- `users`: profile data, `paymentDetails`, `currency`, and activity timestamps.
- `groups`: membership is duplicated in both `members` and `memberDetails`. Keep both in sync on create, join, invite acceptance, and leave flows.
- `expenses`: regular expenses and settlements both live here. Settlement writes currently use `type: "settlement"` and `isSettlement: true`.
- `invites`: pending username-based invites.
- `activities`: append-only activity log written through `logActivity`.
- `settlements`: referenced by rules and delete flows, but the active settle UX writes settlement records into `expenses`.

## Repo Conventions
- Match the style of the file you touch. Many pages use large inline `styles` objects instead of Tailwind utilities.
- Most route files are client components. Do not convert auth/group flows to server components casually.
- Preserve `onSnapshot` subscriptions and cleanup behavior in dashboard, group detail, and activity pages.
- Use `Timestamp.now()` for Firestore writes unless a field is intentionally local-only.
- If you change Firestore document shapes, update `src/types/index.ts` and `firestore.rules` together.
- Reuse existing helpers such as `formatCurrency`, `formatRelativeTime`, `logActivity`, and the settlement utilities before adding new copies of the same logic.
- Be careful with offline behavior. `AuthContext` and Firestore persistence are intentionally tolerant of partial connectivity.

## High-Risk Flows
- Group creation, joining, invite acceptance, and leaving: these all depend on `members` and `memberDetails` staying aligned.
- Group deletion and "last member leaves": child docs are deleted first, then the group doc, to satisfy current Firestore security rule behavior.
- Auth gating: `/login`, `/signup`, `/forgot-password`, `/verify-email`, and `/onboarding` interact with `(app)/layout.tsx`.
- Expense entry and settlement math: group balances are recalculated from `expenses`, not from cached summary fields.
- Payment details: UPI and bank info are read from `user.paymentDetails` during settlement.

## Known Gotchas
- `src/app/join/[code]/page.tsx` links to login/signup with a `redirect` query param, but the auth pages do not currently consume that param.
- Currency is configurable, but several pages still hardcode INR or UPI-oriented assumptions. Check for `₹`, `"INR"`, and `upi://` before calling a flow multi-currency-safe.
- `var(--color-secondary)` is referenced in a few places but is not defined in `src/app/globals.css`.
- There is duplicated cascading-delete logic in `src/components/ui/GroupSettingsModal.tsx` and `src/app/(app)/group/[id]/page.tsx`. If you change one, change the other or extract shared code.
- `src/components/ExpenseModal.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomNav.tsx`, `src/lib/cloudinary.ts`, `generateInviteCode` in `src/lib/utils.ts`, and some helpers in `src/lib/algorithms.ts` appear unused today. Do not remove them without checking product intent.
- `src/components/ui/DotGrid.tsx` is performance-sensitive and uses window-level listeners. Edit carefully.

## Verification Checklist
- Run `npm run lint`.
- Manually smoke test any touched flow, especially:
- auth -> verify email -> onboarding
- create group -> invite/join group
- add expense -> custom split -> settlement
- profile/payment detail updates
- settings changes such as currency or install prompt behavior
