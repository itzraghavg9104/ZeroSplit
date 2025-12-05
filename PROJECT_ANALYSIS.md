# Project Analysis: ZeroSplit

## 1. Executive Summary
ZeroSplit is a robust Progressive Web Application (PWA) built to solve the recurring problem of shared expense management. Unlike traditional split-wise clones, ZeroSplit focuses on a "Mobile-First" experience with high-quality UI/UX (Glassmorphism, Dark/Light modes) and seamless real-time synchronization. The primary goal is to minimize friction in adding expenses and settling debts.

## 2. Core Architecture

### Frontend Layer
- **Framework**: Next.js 16 utilizing the App Router for simplified routing and layout management.
- **State Management**: React Context (`AuthContext`, `ThemeContext`) handles global user state and preferences.
- **Styling**: A hybrid approach using Tailwind CSS for layout utility and custom CSS (via `globals.css` and CSS modules) for complex animations (e.g., the DotGrid background).

### Backend / Data Layer
- **Firebase Firestore**: A NoSQL document database chosen for its flexibility and real-time capabilities (`onSnapshot`).
  - **Data Model**:
    - `users`: Stores profiles, preferences, and payment details (UPI/Bank).
    - `groups`: Top-level collection for expense groups.
    - `expenses`: Stored as a root collection or sub-collection (depending on query pattern), linked by `groupId`.
    - `activities`: Tracks timeline events (Member added, Expense created).
    - `invites`: Manages pending group invitations.
- **Authentication**: Firebase Auth handles Email/Password sign-ins and session management.

## 3. Key Modules & Logic

### Settlement Algorithm (`src/utils/settlements.ts`)
The core value proposition is calculating "Who owes Who".
- **Logic**: It iterates through specific group expenses, calculating the net balance for each member (Paid - Share).
- **Optimization**: It simplifies the debt graph to minimize the number of transactions required to reach zero balance.

### Group Details Page (`src/app/(app)/group/[id]/page.tsx`)
This is the most complex view in the application.
- **Refactoring Strategy**: To manage complexity, modal interactions (Inviting members, Settling debts) were extracted into isolated components (`InviteModal`, `SettleModal`).
- **Data Fetching**: Uses real-time listeners to ensure that if one user adds an expense, all other group members see it instantly without refreshing.

### PWA Implementation
- Uses `next-pwa` to generate a service worker.
- **Install Flow**: Custom logic in the Landing Page captures the `beforeinstallprompt` event to present a custom "Install App" button, providing a native-app-like installation experience on supported browsers.

## 4. Workflows

### Onboarding
`AppLayout` enforces a strict onboarding check. If a user is authenticated but lacks a `username` or `firstName`, they are redirected to `/onboarding`. This ensures data integrity across the app.

### Expense & Settlement Flow
1.  **Creation**: User creates an expense in a group.
2.  **Calculation**: App recalculates balances locally and updates the database.
3.  **Notification**: An activity log is generated.
4.  **Settlement**: When a user pays back (via UPI deep link or cash), a special "Settlement" expense is recorded, neutralizing the balance.

## 5. Security Analysis
- **Firestore Rules**: Rules strictly enforce that users can only read/write data for groups they are members of.
- **Environment Handling**: API keys are restricted to client-side usage via `NEXT_PUBLIC_` prefix, adhering to Firebase's security model.

## 6. Future Roadmap
- **Push Notifications**: Integrate FCM to alert users of new expenses.
- **Interactive Charts**: Visual breakdown of spending habits in the Dashboard.
- **Multi-currency Support**: Enhanced support for international trips.

---
**Maintained by:** Raghav Gupta
**Contact:** contact.zerosplit@gmail.com
