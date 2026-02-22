import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";

interface Article {
    id: number;
    title: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_approved: boolean;
    shipping_cost: number;
    category_id: number | null;
}

const getFirstImage = (url: string | null): string | null => {
    if (!url) return null;
    try {
        if (url.startsWith("[")) {
            const arr = JSON.parse(url);
            return arr.length > 0 ? arr[0] : null;
        }
    } catch {
        // fallback
    }
    return url;
};

export const ProfilePage = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(true);

    useEffect(() => {
        if (user && (user.role === "seller" || user.role === "admin")) {
            api.get("/articles/mine")
                .then((res) => {
                    setArticles(res.data);
                    setArticlesLoading(false);
                })
                .catch(() => setArticlesLoading(false));
        } else {
            setArticlesLoading(false);
        }
    }, [user]);

    if (!user) return null;

    const approvedCount = articles.filter((a) => a.is_approved).length;
    const pendingCount = articles.filter((a) => !a.is_approved).length;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 pb-12 page-enter">
            <div className="w-full max-w-3xl space-y-8">
                {/* Profile Header */}
                <Card className="animate-fade-in-up shadow-lg overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                    <CardHeader className="-mt-12 pb-4">
                        <div className="flex items-end gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-primary/10 border-4 border-background flex items-center justify-center text-3xl font-bold text-primary shadow-lg">
                                {(user.full_name || user.email)
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                                <CardTitle className="text-2xl truncate">
                                    {user.full_name || "No name set"}
                                </CardTitle>
                                <CardDescription className="truncate">
                                    {user.email}
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="transition-all-smooth hover:scale-105 mb-1"
                            >
                                <Link to="/settings">⚙ Settings</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-extrabold">
                                    {articles.length}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Listings
                                </p>
                            </div>
                            {(user.role === "seller" ||
                                user.role === "admin") && (
                                <>
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-green-600">
                                            {approvedCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Approved
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-extrabold text-yellow-600">
                                            {pendingCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Pending
                                        </p>
                                    </div>
                                </>
                            )}
                            <div className="ml-auto">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Listings */}
                {(user.role === "seller" || user.role === "admin") && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between animate-fade-in">
                            <h2 className="text-xl font-bold">My Listings</h2>
                            <Button
                                size="sm"
                                asChild
                                className="transition-all-smooth hover:scale-105"
                            >
                                <Link to="/new">+ New Item</Link>
                            </Button>
                        </div>

                        {articlesLoading && (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-20 rounded-xl animate-shimmer"
                                    />
                                ))}
                            </div>
                        )}

                        {!articlesLoading && articles.length === 0 && (
                            <Card className="animate-fade-in-up">
                                <CardContent className="py-12 text-center">
                                    <div className="text-4xl mb-3">📦</div>
                                    <p className="text-muted-foreground font-medium">
                                        No items listed yet
                                    </p>
                                    <p className="text-sm text-muted-foreground/70 mt-1">
                                        Start selling by listing your first
                                        item!
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {!articlesLoading && articles.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {articles.map((article, i) => (
                                    <Link
                                        key={article.id}
                                        to={`/article/${article.id}`}
                                        className="block"
                                    >
                                        <Card
                                            className={`card-hover overflow-hidden cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                                        >
                                            <div className="aspect-video bg-muted relative overflow-hidden group">
                                                {getFirstImage(
                                                    article.image_url,
                                                ) ? (
                                                    <img
                                                        src={
                                                            getFirstImage(
                                                                article.image_url,
                                                            )!
                                                        }
                                                        alt={article.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground/30">
                                                        📸
                                                    </div>
                                                )}
                                                <span
                                                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        article.is_approved
                                                            ? "bg-green-500/90 text-white"
                                                            : "bg-yellow-500/90 text-white"
                                                    }`}
                                                >
                                                    {article.is_approved
                                                        ? "✓ Live"
                                                        : "⏳ Pending"}
                                                </span>
                                                <div className="absolute bottom-2 left-2 glass px-2 py-0.5 rounded text-sm font-bold">
                                                    ${article.price.toFixed(2)}
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-bold truncate">
                                                    {article.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {article.description ||
                                                        "No description"}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
