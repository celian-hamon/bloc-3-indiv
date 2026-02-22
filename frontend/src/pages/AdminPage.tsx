import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface Article {
    id: number;
    title: string;
    description: string | null;
    price: number;
    image_url: string | null;
    seller_id: number;
    is_approved: boolean;
    category_id: number | null;
    shipping_cost: number;
}

export const AdminPage = () => {
    const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchPending = async () => {
        try {
            const res = await api.get("/articles/admin/all");
            setPendingArticles(res.data);
            setLoading(false);
        } catch {
            setError(
                "Failed to fetch articles. Make sure you have admin privileges.",
            );
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (articleId: number) => {
        setActionLoading(articleId);
        try {
            await api.put(`/articles/${articleId}/approve`);
            // Remove from pending list
            setPendingArticles((prev) =>
                prev.map((a) =>
                    a.id === articleId ? { ...a, is_approved: true } : a,
                ),
            );
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Failed to approve article.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (articleId: number) => {
        if (!confirm("Delete this article permanently?")) return;
        setActionLoading(articleId);
        try {
            await api.delete(`/articles/${articleId}`);
            setPendingArticles((prev) =>
                prev.filter((a) => a.id !== articleId),
            );
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Failed to delete article.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 pb-12 page-enter">
            <div className="w-full max-w-5xl">
                <div className="animate-fade-in mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                        Admin Panel
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage articles, approve listings, and moderate content.
                    </p>
                </div>

                {loading && (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 rounded-xl animate-shimmer"
                            />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive font-semibold rounded-md text-center max-w-md mx-auto animate-scale-in">
                        {error}
                    </div>
                )}

                {!loading && !error && pendingArticles.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-card animate-fade-in-up">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-muted-foreground">
                            No Articles
                        </h3>
                        <p className="mt-2 text-muted-foreground/80">
                            No articles found in the system.
                        </p>
                    </div>
                )}

                {pendingArticles.length > 0 && (
                    <div className="space-y-4">
                        {pendingArticles.map((article, i) => (
                            <Card
                                key={article.id}
                                className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)} ${!article.is_approved ? "border-yellow-500/30 bg-yellow-500/5" : ""}`}
                            >
                                <CardContent className="p-5 flex gap-5 items-center">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {article.image_url ? (
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                📸
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg truncate">
                                                {article.title}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    article.is_approved
                                                        ? "bg-green-500/10 text-green-600"
                                                        : "bg-yellow-500/10 text-yellow-600"
                                                }`}
                                            >
                                                {article.is_approved
                                                    ? "Approved"
                                                    : "Pending"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {article.description ||
                                                "No description"}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1 text-sm">
                                            <span className="font-semibold">
                                                ${article.price.toFixed(2)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Seller #{article.seller_id}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        {!article.is_approved && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleApprove(article.id)
                                                }
                                                disabled={
                                                    actionLoading === article.id
                                                }
                                                className="transition-all-smooth hover:scale-105"
                                            >
                                                {actionLoading === article.id
                                                    ? "..."
                                                    : "Approve"}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(article.id)
                                            }
                                            disabled={
                                                actionLoading === article.id
                                            }
                                            className="transition-all-smooth"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
