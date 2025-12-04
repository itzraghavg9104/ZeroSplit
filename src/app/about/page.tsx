import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Split, Zap, Shield, Code } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "About",
    description:
        "Learn about FairSplit and how we make expense splitting simple and fair.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-4">About FairSplit</h1>
                <p className="text-muted mb-8 text-lg">
                    FairSplit is a modern expense splitting app designed to make shared
                    finances simple and fair.
                </p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Split className="w-5 h-5 text-primary" />
                            Our Mission
                        </h2>
                        <p className="text-muted">
                            We believe splitting expenses shouldn&apos;t be complicated. Whether
                            you&apos;re on a trip with friends, sharing rent with roommates, or
                            organizing a group dinner, FairSplit handles the math so you can
                            focus on what matters.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Smart Debt Simplification
                        </h2>
                        <p className="text-muted">
                            Our algorithm minimizes the number of transactions needed to
                            settle all debts. Instead of everyone paying everyone, we find the
                            most efficient path to zero balances. For example, if A owes B ₹100
                            and B owes C ₹100, we&apos;ll simply tell A to pay C directly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Privacy First
                        </h2>
                        <p className="text-muted">
                            Your financial data is yours. We use Firebase&apos;s secure
                            infrastructure to keep your expense data private and encrypted.
                            We never sell your data or show you ads.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Code className="w-5 h-5 text-primary" />
                            Built with Modern Tech
                        </h2>
                        <p className="text-muted">
                            FairSplit is built as a Progressive Web App (PWA) using Next.js,
                            Tailwind CSS, and Firebase. This means it works offline, can be
                            installed on your device, and provides a native app-like
                            experience.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-border">
                    <h3 className="font-semibold mb-4">Ready to get started?</h3>
                    <Link href="/signup">
                        <Button>Create Free Account</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
