# ZeroSplit

Mobile-first expense-sharing PWA for splitting costs among groups.

## Stack
- Next.js 16 App Router, React 19, TypeScript
- Firebase Auth + Firestore (persistent cache, multi-tab)
- Tailwind CSS 4 + inline style objects
- Cloudinary uploads, GSAP animations
- next-pwa for install/offline

## Key Flows
- Auth: signup → email verify → onboarding → app
- Groups: create → invite/join → expense tracking → settlement
- Expenses: add → custom split → balance calculation → settle up

## Firestore Schema
- `users`: profile, paymentDetails, currency
- `groups`: members + memberDetails (keep synced)
- `expenses`: regular + settlements (`type: "settlement"`)
- `invites`: username-based pending invites
- `activities`: append-only log

## Gotchas
- Currency hardcoded as INR/₹ in places
- `var(--color-secondary)` undefined in globals.css
- Duplicate cascading-delete logic in GroupSettingsModal + group detail page
- Unused: ExpenseModal, Sidebar, BottomNav, cloudinary.ts, generateInviteCode
- DotGrid.tsx is performance-sensitive

## Commands
```bash
npm run dev    # Start dev server
npm run lint   # Lint check
```

## Verification Checklist
- [ ] Auth → verify → onboarding flow
- [ ] Create group → invite/join
- [ ] Add expense → custom split → settlement
- [ ] Profile/payment details update
- [ ] Settings (currency, install prompt)
