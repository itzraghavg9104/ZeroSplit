import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ZeroSplit - Split Expenses Fairly",
    template: "%s | ZeroSplit",
  },
  description:
    "Split expenses with friends and minimize transactions with smart debt simplification.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logoIcon.png",
    apple: "/logoIcon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZeroSplit",
  },
  keywords: [
    "split expenses",
    "bill splitting",
    "group finance",
    "debt simplification",
    "expense tracker",
    "ZeroSplit",
    "shared expenses",
    "roommate expenses",
    "trip expenses",
    "money manager",
    "finance app"
  ],
  authors: [{ name: "Raghav Gupta", url: "https://zerosplit.vercel.app" }],
  creator: "Raghav Gupta",
  publisher: "ZeroSplit",
  applicationName: "ZeroSplit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zerosplit.vercel.app",
    siteName: "ZeroSplit",
    title: "ZeroSplit - Split Expenses Fairly",
    description:
      "Split expenses with friends and minimize transactions with smart debt simplification.",
    images: [
      {
        url: "/logoFull.png", // Ensure this image exists in public folder or fallback to logoIcon
        width: 1200,
        height: 630,
        alt: "ZeroSplit Preview",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroSplit - Split Expenses Fairly",
    description: "Split expenses with friends and minimize transactions with smart debt simplification.",
    creator: "Raghav Gupta",
    images: ["/logoFull.png"],
  },
  verification: {
    google: "rAAzIjmpK23zry0I96bgGY6d2jtjdDRuKsyloHFT4Gw",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
