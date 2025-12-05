# ZeroSplit - Comprehensive Project Analysis

**Version**: 2.0.0
**Last Updated**: December 2025
**Maintainer**: Raghav Gupta
**Contact**: contact.zerosplit@gmail.com

---

## 1. Executive Summary

**ZeroSplit** is a cutting-edge, "Mobile-First" Progressive Web Application (PWA) designed to revolutionize expense sharing. Unlike traditional split-wise clones that suffer from bloated UIs and slow synchronization, ZeroSplit prioritizes:
- **Instant Speed**: Real-time data sync using Firestore listeners.
- **Visual Excellence**: A high-end Glassmorphism aesthetic with dynamic, interactive backgrounds (DotGrid).
- **Reduced Friction**: Simplified flows for adding expenses, settling debts, and onboarding new users.

It is built on the bleeding edge of web technology, leveraging **Next.js 16** and **React 19** to deliver a near-native app experience on the web.

---

## 2. Technology Stack

### Core Framework
- **Next.js 16.0.7 (App Router)**: Utilizes the latest React Server Components (RSC) architecture for optimal hydration and SEO, while leveraging Client Components for rich interactivity.
- **React 19.2.0**: Takes advantage of the latest React concurrent features and hooks.
- **TypeScript 5**: Ensures full type safety across the entire codebase.

### Styling & UI
- **Tailwind CSS 4**: The latest engine for utility-first styling, providing instant build times and zero-runtime CSS generation.
- **GSAP (GreenSock)**: Powers complex, high-performance animations, specifically the interactive `DotGrid` background.
- **Lucide React**: Provides a consistent, modern icon set.
- **Custom CSS**: Leveraging CSS Variables for theming (Dark/Light mode) and advanced glassmorphism effects (`backdrop-filter`, `mix-blend-mode`).

### Backend & Data
- **Firebase v12**:
  - **Authentication**: Robust email/password and Google OAuth flows.
  - **Firestore**: NoSQL database for real-time document storage.
  - **Storage**: Cloudinary (via distinct API) for optimized image delivery.

### Deployment & PWA
- **Vercel**: Edge-optimized deployment.
- **next-pwa**: Service worker generation for offline capabilities and "Add to Home Screen" support.

---

## 3. Architecture & Design Patterns

### Frontend Architecture
The application follows a **Domain-Driven Directory Structure** within the Next.js App Router:
- `src/app/(auth)`: Enclosed route group for authentication pages (`login`, `signup`), sharing a common layout but isolated from the main app shell.
- `src/app/(app)`: The restricted "Dashboard" area. Protected by a high-order `AppLayout` that strictly enforces authentication and profile completeness.
- `src/components/ui`: Reusable atomic components (`Button`, `Input`, `DotGrid`, `GroupActionModal`).
- `src/contexts`: Global state providers using React Context API (`AuthContext`, `ThemeContext`) to minimalize prop drilling for app-wide settings.

### State Management Strategy
ZeroSplit uses a **Hybrid State Model**:
1.  **Server State (Firestore)**: The "Source of Truth". Real-time listeners (`onSnapshot`) subscribe to collections, ensuring UI updates immediately when backend data changes without manual revalidation.
2.  **Client State (React Context)**: Handles session-specific data (User Auth Object, Active Theme).
3.  **Local State (useState)**: Handles ephemeral UI states (Form inputs, Modal visibility).

### Security Model
- **Route Protection**: `AppLayout` acts as a client-side gatekeeper, redirecting unauthenticated users to `/login` and unverified users to `/verify-email`.
- **Database Security**: Firestore Security Rules (`firestore.rules`) enforce strict ownership:
    - Users can only read/write their own profile.
    - Group data is only accessible to users listed in the `members` array.
    - Expense creation is restricted to group members.

---

## 4. Data Model (Firestore Schema)

### `users` (Collection)
Primary user profiles.
- `id` (uid): Document ID.
- `username`: Unique handle (indexed for availability checks).
- `email`: User email.
- `firstName`, `lastName`: Display names.
- `avatar`: URL to profile picture.
- `paymentMethods`: array of objects `{ type: 'upi' | 'bank', value }`.
- `verificationStatus`: `{ emailVerified: boolean }`.

### `groups` (Collection)
Top-level expense groups.
- `id`: Auto-generated ID.
- `name`: Group display name.
- `type`: 'Trip', 'Home', 'Couple', etc.
- `members`: Array of user UIs `['uid1', 'uid2']`.
- `createdBy`: `uid` of the creator.
- `totalExpenses`: Aggregated total (triggers cloud function update).

### `expenses` (Collection)
*Design Decision: Root collection to allow "Recent Activity" queries across all groups.*
- `groupId`: Reference to parent group.
- `paidBy`: `uid` of payer.
- `amount`: Number.
- `splitBetween`: Array of `uids` involved.
- `description`: Text.
- `timestamp`: Server timestamp.
- `type`: 'expense' | 'settlement'.

### `invites` (Collection)
Pending invitations to join groups.
- `groupId`: Target group.
- `invitedBy`: `uid` of sender.
- `status`: 'pending' | 'accepted' | 'rejected'.
- `code`: 6-digit alphanumeric code for easier sharing.

---

## 5. Key Workflows & Features

### 1. Authentication & Onboarding
- **Sign Up**: Email/Password or Google.
- **Verification Gate**: New accounts are redirected to `/verify-email`. The main app is inaccessible until the email link is clicked.
- **Profile Completion**: Users must provide a `username` before accessing the dashboard.
- **Payment Setup**: Onboarding wizard prompts for UPI/Bank details to enable seamless settlements.

### 2. Group Management
- **Unified Action Modal**: A single `GroupActionModal` handles both creating new groups and joining existing ones (via code).
- **Invite System**: Users can generate shareable links (using Web Share API) or codes.

### 3. Expense Splitting Engine
- **Logic**: When an expense is added, the app calculates the "per person" share.
- **Settlement**: The app identifies debts (e.g., "A owes B $50").
- **Zero The Split**: A dedicated "Settle" mode allows users to mark debts as paid. If payment details are available, it deep-links to payment apps (UPI).

### 4. Real-time Activity Feed
- A global `onSnapshot` listener aggregates activities (New changes, payments, member joins) into a single timeline, keeping users aware of all group actions instantly.

---

## 6. UX/UI Philosophy

### "Glassmorphism & Depth"
The UI uses extensive transparency effects to create depth.
- **Cards**: `.animated-border-card` uses a moving gradient border to draw attention.
- **Backgrounds**: The `DotGrid` component creates a living, breathing background that reacts to mouse movement (`shockRadius` effect), moving away from static white pages.

### "Mobile First"
- **Touch Targets**: All buttons are 44px+ min-height.
- **Navigation**: Instagram-style bottom navigation bar for ease of thumb reach.
- **PWA**: Custom "Add to Home Screen" prompt integrated into the Landing Page.

---

## 7. Future Roadmap

### Short Term (v2.1)
- **Push Notifications**: Integrate Firebase Cloud Messaging (FCM) for "New Expense" alerts.
- **Expense Categories**: Analytics charts breaking down spending by Food, Travel, etc.

### Mid Term (v2.5)
- **Multi-Currency**: Support for international trips with real-time exchange rate conversion.
- **Recurring Expenses**: Logic for rent/subscription splitting.

### Long Term (v3.0)
- **AI Receipt Scanning**: Optical Character Recognition (OCR) to auto-fill expense details from photos.
