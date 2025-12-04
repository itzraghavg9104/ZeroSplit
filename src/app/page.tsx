import Link from "next/link";
import { ArrowRight, Split, Users, Wallet, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: Split,
    title: "Smart Splitting",
    description: "Split expenses equally or with custom amounts for each person.",
  },
  {
    icon: Users,
    title: "Group Management",
    description: "Create groups for trips, roommates, or any shared expenses.",
  },
  {
    icon: Zap,
    title: "Debt Simplification",
    description: "Our algorithm minimizes transactions to settle all balances.",
  },
  {
    icon: Wallet,
    title: "Easy Settlement",
    description: "See exactly who owes whom and settle with saved payment details.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold">FairSplit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-slideUp">
            Split expenses.
            <br />
            <span className="text-primary">Minimize hassle.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto animate-fadeIn">
            FairSplit helps you track shared expenses and settles debts with the
            fewest transactions possible.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
            <Link href="/signup">
              <Button size="lg">
                Start Splitting Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything you need to split fairly
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to simplify your expenses?
          </h2>
          <p className="text-muted mb-8">
            Join thousands of users who are already splitting expenses the smart way.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-medium">FairSplit</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} FairSplit. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
