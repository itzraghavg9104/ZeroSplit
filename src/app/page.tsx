"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sun, Moon, Menu, X, ArrowRight, Users, Receipt,
  Wallet, Zap, ChevronRight, Home, Plus, Bell, User, Mail
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import DotGrid from "@/components/ui/DotGrid";

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

  // DotGrid colors based on theme
  const dotBaseColor = resolvedTheme === "dark" ? "#262626" : "#e5e5e5";
  const dotActiveColor = "#0095F6";

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
      overflowX: "hidden" as const,
      position: "relative" as const, // Ensure context for absolute positioning
    },
    header: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      height: "72px",
      backgroundColor: "rgba(var(--color-background-rgb), 0.8)", // Glass effect
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      zIndex: 100,
    },
    logo: {
      display: "flex",
      alignItems: "center",
    },
    logoImg: {
      height: "40px",
      width: "auto",
      filter: logoFilter,
    },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    iconBtn: {
      width: "44px",
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "none",
      border: "none",
      color: "var(--color-foreground)",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    loginBtn: {
      padding: "10px 24px",
      backgroundColor: "transparent",
      color: "var(--color-foreground)",
      border: "1px solid var(--color-border)",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
    },
    signupBtn: {
      padding: "10px 24px",
      backgroundColor: "#0095F6",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0, 149, 246, 0.3)",
    },
    main: {
      paddingTop: "72px",
      paddingBottom: user ? "80px" : "140px",
      position: "relative" as const,
    },
    hero: {
      padding: "80px 24px",
      textAlign: "center" as const,
      maxWidth: "800px",
      margin: "0 auto",
      position: "relative" as const,
      zIndex: 1,
    },
    heroTitle: {
      fontSize: "clamp(40px, 10vw, 64px)",
      fontWeight: 800,
      lineHeight: 1.1,
      marginBottom: "24px",
      letterSpacing: "-0.02em",
    },
    heroGradient: {
      background: "linear-gradient(135deg, #0095F6, #00D4AA)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    heroText: {
      fontSize: "clamp(18px, 4vw, 20px)",
      color: "var(--color-muted)",
      lineHeight: 1.6,
      marginBottom: "40px",
      maxWidth: "600px",
      marginLeft: "auto",
      marginRight: "auto",
    },
    heroButtons: {
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      flexWrap: "wrap" as const,
    },
    primaryBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "16px 32px",
      backgroundColor: "#0095F6",
      color: "white",
      border: "none",
      borderRadius: "16px",
      fontSize: "18px",
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(0, 149, 246, 0.4)",
      transition: "transform 0.2s",
    },
    secondaryBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "16px 32px",
      backgroundColor: "var(--color-card)",
      color: "var(--color-foreground)",
      border: "1px solid var(--color-border)",
      borderRadius: "16px",
      fontSize: "18px",
      fontWeight: 600,
      cursor: "pointer",
    },
    features: {
      padding: "80px 24px",
      maxWidth: "1000px",
      margin: "0 auto",
      position: "relative" as const,
      zIndex: 1,
    },
    featuresTitle: {
      textAlign: "center" as const,
      fontSize: "32px",
      fontWeight: 700,
      marginBottom: "48px",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "24px",
    },
    featureCard: {
      padding: "32px",
      backgroundColor: "var(--color-card)",
      borderRadius: "24px",
      border: "1px solid var(--color-border)",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    featureIcon: {
      width: "56px",
      height: "56px",
      backgroundColor: "rgba(0, 149, 246, 0.1)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "12px",
    },
    featureDesc: {
      fontSize: "15px",
      color: "var(--color-muted)",
      lineHeight: 1.6,
    },
    footer: {
      borderTop: "1px solid var(--color-border)",
      backgroundColor: "var(--color-card)",
      padding: "60px 24px",
      textAlign: "center" as const,
      position: "relative" as const,
      zIndex: 1,
    },
    footerContent: {
      maxWidth: "400px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "24px",
    },
    footerLogo: {
      height: "32px",
      width: "auto",
      filter: logoFilter,
    },
    footerContact: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 20px",
      backgroundColor: "rgba(0, 149, 246, 0.05)",
      borderRadius: "50px",
      color: "#0095F6",
      fontSize: "14px",
      fontWeight: 500,
      textDecoration: "none",
    },
    footerCopyright: {
      fontSize: "13px",
      color: "var(--color-muted)",
      marginTop: "12px",
    },
    bottomBar: {
      position: "fixed" as const,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(var(--color-background-rgb), 0.9)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid var(--color-border)",
      zIndex: 90,
    },
    loginPrompt: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    promptText: {
      flex: 1,
    },
    promptTitle: {
      fontWeight: 700,
      fontSize: "16px",
      marginBottom: "2px",
    },
    promptSubtitle: {
      fontSize: "14px",
      color: "var(--color-muted)",
    },
    promptBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "12px 24px",
      backgroundColor: "#0095F6",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    bottomNav: {
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      paddingBottom: "env(safe-area-inset-bottom)",
      maxWidth: "600px",
      margin: "0 auto",
    },
    overlay: {
      position: "fixed" as const,
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      zIndex: 95,
    },
    mobileMenu: {
      position: "fixed" as const,
      top: 0,
      right: 0,
      bottom: 0,
      width: "300px",
      backgroundColor: "var(--color-background)",
      borderLeft: "1px solid var(--color-border)",
      padding: "80px 24px 24px",
      zIndex: 98,
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
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#0095F6",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0, 149, 246, 0.3)",
                      }}
                    >
                      <Plus size={24} color="white" strokeWidth={2.5} />
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
      {/* Interactive Dot Grid Background */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "auto", // Important for interaction
      }}>
        <DotGrid
          baseColor={dotBaseColor}
          activeColor={dotActiveColor}
          gap={32}
          dotSize={4} // Increased size
          proximity={150}
          shockRadius={200}
        />
      </div>

      {/* Header */}
      <header style={{
        ...styles.header,
        backgroundColor: "transparent",
        backdropFilter: "none",
        borderBottom: "none",
      }}>
        <Link href="/" style={styles.logo}>
          <img src="/logoFull.png" alt="ZeroSplit" style={styles.logoImg} />
        </Link>

        <div style={styles.headerActions}>
          <button onClick={toggleTheme} style={styles.iconBtn}>
            {resolvedTheme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          {/* Desktop buttons */}
          <div style={{ display: "flex", gap: "12px" }} className="hidden-mobile">
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
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
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
            Track shared expenses, simplify debts, and settle up instantly. No more awkward math.
          </p>
          <div style={styles.heroButtons}>
            <Link href={user ? "/dashboard" : "/signup"}>
              <button style={styles.primaryBtn}>
                {user ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight size={20} />
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
                  <feature.icon size={28} color="#0095F6" />
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          ...styles.footer,
          backgroundColor: "transparent",
          borderTop: "none",
        }}>
          <div style={styles.footerContent}>
            <img src="/logoFull.png" alt="ZeroSplit" style={styles.footerLogo} />

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="mailto:contact.zerosplit@gmail.com" style={styles.footerContact}>
                <Mail size={16} />
                Contact Us
              </a>
              <a href="mailto:contact.zerosplit@gmail.com?subject=Feedback%20or%20Suggestion" style={{ ...styles.footerContact, backgroundColor: "transparent", border: "1px solid rgba(0, 149, 246, 0.2)" }}>
                <span style={{ fontSize: "14px" }}>Feedback or Suggestion</span>
              </a>
            </div>

            <p style={styles.footerCopyright}>
              © {new Date().getFullYear()} ZeroSplit. All rights reserved.
            </p>
          </div>
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
