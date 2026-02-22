import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export const ShowcasePage = () => {
    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 pt-16 text-center">
                {/* BG gradient blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-float" />
                    <div
                        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl animate-float"
                        style={{ animationDelay: "1.5s" }}
                    />
                </div>

                <div className="relative z-10 max-w-3xl">
                    <span className="inline-block px-4 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide animate-fade-in">
                        ✨ A Modern Collector Marketplace
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
                        Buy &amp; Sell{" "}
                        <span className="text-primary">Collectables</span>
                        <br />
                        With Confidence
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">
                        Discover rare items, list your own treasures, and
                        connect with collectors around the world — all on a
                        platform built for speed and trust.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
                        <Button
                            size="lg"
                            asChild
                            className="px-8 text-base transition-all-smooth hover:scale-105"
                        >
                            <Link to="/register">Get Started Free</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="px-8 text-base transition-all-smooth hover:scale-105"
                        >
                            <Link to="/">Browse Catalog</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-muted/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Our platform is designed for both buyers and sellers
                            with powerful tools built in.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🔒",
                                title: "Secure Authentication",
                                desc: "Industry-standard OAuth2 with JWT ensures your account and data stay safe.",
                            },
                            {
                                icon: "📦",
                                title: "Easy Listing",
                                desc: "Sellers can list items in seconds with image uploads, categories, and pricing.",
                            },
                            {
                                icon: "✅",
                                title: "Admin Approvals",
                                desc: "Every listing goes through admin review for quality assurance before going live.",
                            },
                            {
                                icon: "💳",
                                title: "Transparent Pricing",
                                desc: "Clearly displayed prices with shipping costs — no hidden fees.",
                            },
                            {
                                icon: "🚀",
                                title: "Blazing Fast API",
                                desc: "Built on FastAPI with async database queries for millisecond response times.",
                            },
                            {
                                icon: "📊",
                                title: "Fraud Detection",
                                desc: "Intelligent price change monitoring to detect and prevent fraudulent listings.",
                            },
                        ].map((feature, i) => (
                            <div
                                key={feature.title}
                                className={`rounded-xl border border-border/50 bg-card p-8 card-hover animate-fade-in-up stagger-${i + 1}`}
                            >
                                <div className="text-4xl mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Active Users", value: "1K+" },
                        { label: "Items Listed", value: "5K+" },
                        { label: "Transactions", value: "10K+" },
                        { label: "Uptime", value: "99.9%" },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`animate-fade-in-up stagger-${i + 1}`}
                        >
                            <div className="text-4xl font-extrabold text-primary">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-muted/30">
                <div className="max-w-2xl mx-auto text-center animate-fade-in">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                        Ready to Start Collecting?
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8">
                        Join our growing community of collectors and find your
                        next treasure today.
                    </p>
                    <Button
                        size="lg"
                        asChild
                        className="px-10 text-base transition-all-smooth hover:scale-105"
                    >
                        <Link to="/register">Create Your Account</Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <span>
                        &copy; {new Date().getFullYear()} Collector. All rights
                        reserved.
                    </span>
                    <div className="flex gap-6">
                        <Link
                            to="/"
                            className="hover:text-primary transition-colors"
                        >
                            Catalog
                        </Link>
                        <Link
                            to="/showcase"
                            className="hover:text-primary transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/login"
                            className="hover:text-primary transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};
