# ZeroSplit: Split Expenses, Not Friendships 💸

ZeroSplit is a modern, mobile-first web application designed to simplify shared expense tracking. Whether you're splitting bills with roommates, planning a trip, or managing group costs, ZeroSplit handles the math so you can focus on the fun. Built with Next.js 14 and Firebase, it offers real-time syncing, seamless offline support (PWA), and an intuitive "Instagram-like" interface.

**Live Demo:** [https://zerosplit.vercel.app](https://zerosplit.vercel.app)

---

## 🚀 Key Features

### 👥 Group Management
- **Create & Join Groups:** Easily create groups for trips, households, or events.
- **Invite System:** Share unique invite codes or deep links to add members instantly.
- **Member Search:** Add members by searching their unique username.

### 💰 Smart Expense Tracking
- **Easy Entry:** Quickly log expenses, select the payer, and choose who to split with.
- **Flexible Splitting:** Default to equal splits or customize amounts per person.
- **Real-time Feed:** See expenses and activities appear instantly as they happen.

### ⚖️ Settlements made Simple
- **Balances Tab:** Clearly visualize "who owes who" with net balance calculations.
- **"Zero The Split":** Dedicated settlement flow to mark debts as paid.
- **Payment Integration:** Direct deep links to UPI apps (GPay, PhonePe, Paytm) or display Bank Details/IFSC for transfers.

### 📱 Premium User Experience
- **PWA Support:** Install as a native-like app on iOS and Android for offline access.
- **Dark Mode:** Sleek, system-aware dark and light themes.
- **Mobile-First Design:** Bottom navigation, touch-friendly interactions, and responsive layouts.
- **Secure:** Robust authentication and role-based access control via Firebase.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + CSS Modules for custom animations.
- **Backend / Database:** [Firebase](https://firebase.google.com/) (Firestore, Auth).
- **Icons:** [Lucide React](https://lucide.dev/).
- **PWA:** `next-pwa` module.
- **Image handling:** Cloudinary (implied/used for uploads) & `browser-image-compression`.

---

## 📂 Project Structure

```
d:/ZeroSplit
├── src/
│   ├── app/                # Next.js App Router root
│   │   ├── (app)/          # Protected routes (Dashboard, Groups, Profile)
│   │   ├── (auth)/         # Public auth routes (Login, Signup)
│   │   ├── layout.tsx      # Root layout with providers & PWA metadata
│   │   └── page.tsx        # Landing Page
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # MobileNav, Header
│   │   └── ui/             # Buttons, Inputs, Modals
│   ├── contexts/           # Global state (Auth, Theme)
│   ├── lib/                # Configs (Firebase, Utils)
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Business logic (Settlements, Activity logging)
├── public/                 # Static assets (icons, splash screens)
└── firestore.rules         # Database security rules
```

---

## ⚡️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Start-Up-Codes/ZeroSplit.git
    cd ZeroSplit
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file with your Firebase credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📧 Contact

Have feedback or found a bug? Reach out to us at:
**Email:** contact.zerosplit@gmail.com
