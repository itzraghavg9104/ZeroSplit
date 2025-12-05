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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zerosplit.app",
    siteName: "ZeroSplit",
    title: "ZeroSplit - Split Expenses Fairly",
    description:
      "Split expenses with friends and minimize transactions with smart debt simplification.",
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
