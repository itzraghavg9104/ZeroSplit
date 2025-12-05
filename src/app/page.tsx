"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sun, Moon, Menu, X, ArrowRight, Users, Receipt,
  Wallet, Zap, ChevronRight, Home, Plus, Bell, User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const logoFilter = resolvedTheme === "dark" ? "invert(1)" : "none";

  const features = [
    { icon: Users, title: "Group Expenses", desc: "Create groups for trips, roommates, or any shared expenses" },
    { icon: Receipt, title: "Smart Splitting", desc: "Split equally or customize amounts for each person" },
    { icon: Wallet, title: "Easy Settlements", desc: "See who owes what and settle up with a tap" },
    { icon: Zap, title: "Real-time Sync", desc: "Changes sync instantly across all devices" },
  ];

  const bottomNavItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/groups", label: "Groups", icon: Users },
    { href: "/create-group", label: "Create", icon: Plus, isCenter: true },
    { href: "/activity", label: "Activity", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "var(--color-background)",
      color: "var(--color-foreground)",
    },
    header: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      height: "64px",
      backgroundColor: "var(--color-background)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 100,
    },
    logo: {
      display: "flex",
      alignItems: "center",
    },
    logoImg: {
      height: "32px",
      width: "auto",
      filter: logoFilter,
    },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    iconBtn: {
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "none",
      border: "none",
      color: "var(--color-foreground)",
      borderRadius: "10px",
      cursor: "pointer",
    },
    loginBtn: {
      padding: "10px 20px",
      backgroundColor: "transparent",
      color: "var(--color-foreground)",
      border: "1px solid var(--color-border)",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
    },
    signupBtn: {
      padding: "10px 20px",
      backgroundColor: "#0095F6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    main: {
      paddingTop: "64px",
      paddingBottom: user ? "80px" : "140px",
    },
    hero: {
      padding: "60px 20px",
      textAlign: "center" as const,
      maxWidth: "600px",
      margin: "0 auto",
    },
    heroTitle: {
      fontSize: "clamp(32px, 8vw, 48px)",
      fontWeight: 800,
      lineHeight: 1.2,
      marginBottom: "20px",
    },
    heroGradient: {
      background: "linear-gradient(135deg, #0095F6, #00D4AA)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    heroText: {
      fontSize: "18px",
      color: "var(--color-muted)",
      lineHeight: 1.6,
      marginBottom: "32px",
    },
    heroButtons: {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      flexWrap: "wrap" as const,
    },
    primaryBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "14px 28px",
      backgroundColor: "#0095F6",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
    },
    secondaryBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "14px 28px",
      backgroundColor: "var(--color-card)",
      color: "var(--color-foreground)",
      border: "1px solid var(--color-border)",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: 500,
      cursor: "pointer",
    },
    features: {
      padding: "40px 20px 60px",
      maxWidth: "900px",
      margin: "0 auto",
    },
    featuresTitle: {
      textAlign: "center" as const,
      fontSize: "24px",
      fontWeight: 700,
      marginBottom: "32px",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
    },
    featureCard: {
      padding: "24px",
      backgroundColor: "var(--color-card)",
      borderRadius: "16px",
      border: "1px solid var(--color-border)",
    },
    featureIcon: {
      width: "48px",
      height: "48px",
      backgroundColor: "rgba(0, 149, 246, 0.1)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
    },
    featureTitle: {
      fontSize: "16px",
      fontWeight: 600,
      marginBottom: "8px",
    },
    featureDesc: {
      fontSize: "14px",
      color: "var(--color-muted)",
      lineHeight: 1.5,
    },
    footer: {
      borderTop: "1px solid var(--color-border)",
      padding: "24px 20px",
      textAlign: "center" as const,
    },
    footerLogo: {
      height: "24px",
      width: "auto",
      marginBottom: "12px",
      filter: logoFilter,
    },
    footerText: {
      fontSize: "13px",
      color: "var(--color-muted)",
    },
    bottomBar: {
      position: "fixed" as const,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "var(--color-background)",
      borderTop: "1px solid var(--color-border)",
      zIndex: 90,
    },
    loginPrompt: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
    },
    promptText: {
      flex: 1,
    },
    promptTitle: {
      fontWeight: 600,
      fontSize: "15px",
      marginBottom: "2px",
    },
    promptSubtitle: {
      fontSize: "13px",
      color: "var(--color-muted)",
    },
    promptBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "12px 20px",
      backgroundColor: "#0095F6",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    bottomNav: {
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      paddingBottom: "env(safe-area-inset-bottom)",
    },
    overlay: {
      position: "fixed" as const,
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 90,
    },
    mobileMenu: {
      position: "fixed" as const,
      top: 0,
      right: 0,
      bottom: 0,
      width: "280px",
      backgroundColor: "var(--color-background)",
      borderLeft: "1px solid var(--color-border)",
      padding: "80px 24px 24px",
      zIndex: 95,
      display: "flex",
      flexDirection: "column" as const,
      gap: "16px",
    },
  };

  const renderBottomNav = () => {
    if (user) {
      return (
        <div style={styles.bottomBar}>
          <nav style={styles.bottomNav}>
            {bottomNavItems.map((item) => {
              if (item.isCenter) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      minWidth: "60px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "2px solid var(--color-muted)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={20} color="var(--color-foreground)" strokeWidth={2} />
                    </div>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    minWidth: "60px",
                    color: "var(--color-muted)",
                  }}
                >
                  <item.icon size={26} strokeWidth={1.5} />
                  <span style={{ fontSize: "10px" }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      );
    }

    return (
      <div style={styles.bottomBar}>
        <div style={styles.loginPrompt}>
          <div style={styles.promptText}>
            <p style={styles.promptTitle}>Ready to split?</p>
            <p style={styles.promptSubtitle}>Sign up or log in to get started</p>
          </div>
          <Link href="/signup">
            <button style={styles.promptBtn}>
              Get Started
              <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          <img src="/logoFull.png" alt="ZeroSplit" style={styles.logoImg} />
        </Link>

        <div style={styles.headerActions}>
          <button onClick={toggleTheme} style={styles.iconBtn}>
            {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Desktop buttons */}
          <div style={{ display: "flex", gap: "8px" }} className="hidden-mobile">
            {user ? (
              <Link href="/dashboard">
                <button style={styles.signupBtn}>Dashboard</button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button style={styles.loginBtn}>Log in</button>
                </Link>
                <Link href="/signup">
                  <button style={styles.signupBtn}>Sign up</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={styles.iconBtn}
            className="show-mobile"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsMenuOpen(false)} />
          <div style={styles.mobileMenu}>
            {user ? (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <button style={{ ...styles.signupBtn, width: "100%" }}>
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <button style={{ ...styles.loginBtn, width: "100%" }}>Log in</button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <button style={{ ...styles.signupBtn, width: "100%" }}>
                    Sign up free
                  </button>
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>
            Split expenses,{" "}
            <span style={styles.heroGradient}>not friendships</span>
          </h1>
          <p style={styles.heroText}>
            Track shared expenses, split bills fairly, and settle up easily with friends (and family — no judgment).
          </p>
          <div style={styles.heroButtons}>
            <Link href={user ? "/dashboard" : "/signup"}>
              <button style={styles.primaryBtn}>
                {user ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight size={18} />
              </button>
            </Link>
            {!user && (
              <Link href="/login">
                <button style={styles.secondaryBtn}>
                  I have an account
                </button>
              </Link>
            )}
          </div>
        </section>

        {/* Features */}
        <section style={styles.features}>
          <h2 style={styles.featuresTitle}>Everything you need</h2>
          <div style={styles.featuresGrid}>
            {features.map((feature, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <feature.icon size={24} color="#0095F6" />
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <img src="/logoFull.png" alt="ZeroSplit" style={styles.footerLogo} />
          <p style={styles.footerText}>© 2024 ZeroSplit. Split expenses, not friendships.</p>
        </footer>
      </main>

      {/* Bottom Bar */}
      {renderBottomNav()}

      <style jsx global>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
