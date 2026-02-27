import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { FormError } from "../components/ui/form-error";

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

interface Category {
    id: number;
    name: string;
    description: string | null;
}

interface FraudLogEntry {
    id: number;
    article_id: number;
    seller_id: number;
    old_price: number;
    new_price: number;
    change_pct: number;
    reason: string;
    is_suspicious: boolean;
    resolved: boolean;
    created_at: string;
}

type Tab = "articles" | "categories" | "fraud";

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

export const AdminPage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [totalArticles, setTotalArticles] = useState(0);
    const [articlePage, setArticlePage] = useState(1);
    const articleLimit = 20;
    const [categories, setCategories] = useState<Category[]>([]);
    const [fraudLogs, setFraudLogs] = useState<FraudLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Category form
    const [newCatName, setNewCatName] = useState("");
    const [newCatDesc, setNewCatDesc] = useState("");
    const [catLoading, setCatLoading] = useState(false);
    const [catError, setCatError] = useState("");

    // Fraud filter
    const [fraudFilter, setFraudFilter] = useState<
        "all" | "suspicious" | "resolved"
    >("suspicious");

    const [tab, setTab] = useState<Tab>("articles");

    const fetchArticles = useCallback(() => {
        setLoading(true);
        const skip = (articlePage - 1) * articleLimit;
        api.get(`/articles/admin/all?skip=${skip}&limit=${articleLimit}`)
            .then((res) => {
                setArticles(res.data.items);
                setTotalArticles(res.data.total);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch articles.");
                setLoading(false);
            });
    }, [articlePage]);

    const fetchCategories = () => {
        api.get("/categories/")
            .then((res) => setCategories(res.data))
            .catch(() => {});
    };

    const fetchFraudLogs = () => {
        api.get("/fraud-logs/")
            .then((res) => setFraudLogs(res.data))
            .catch(() => {});
    };

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    useEffect(() => {
        fetchCategories();
        fetchFraudLogs();
    }, []);

    // Article actions
    const handleApprove = async (articleId: number) => {
        setActionLoading(articleId);
        try {
            await api.put(`/articles/${articleId}/approve`);
            setArticles((prev) =>
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

    const handleDeleteArticle = async (articleId: number) => {
        if (!confirm("Delete this article permanently?")) return;
        setActionLoading(articleId);
        try {
            await api.delete(`/articles/${articleId}`);
            setArticles((prev) => prev.filter((a) => a.id !== articleId));
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Failed to delete article.");
        } finally {
            setActionLoading(null);
        }
    };

    // Category actions
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setCatLoading(true);
        setCatError("");
        try {
            const res = await api.post("/categories/", {
                name: newCatName.trim(),
                description: newCatDesc.trim() || null,
            });
            setCategories((prev) => [...prev, res.data]);
            setNewCatName("");
            setNewCatDesc("");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setCatError(
                error.response?.data?.detail || "Failed to create category.",
            );
        } finally {
            setCatLoading(false);
        }
    };

    const handleDeleteCategory = async (catId: number) => {
        if (!confirm("Delete this category?")) return;
        try {
            await api.delete(`/categories/${catId}`);
            setCategories((prev) => prev.filter((c) => c.id !== catId));
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Failed to delete category.");
        }
    };

    // Fraud actions
    const handleResolveFraud = async (logId: number) => {
        try {
            await api.put(`/fraud-logs/${logId}/resolve`);
            setFraudLogs((prev) =>
                prev.map((l) =>
                    l.id === logId ? { ...l, resolved: true } : l,
                ),
            );
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Failed to resolve.");
        }
    };

    const getCategoryName = (catId: number | null) => {
        if (!catId) return null;
        return categories.find((c) => c.id === catId)?.name || null;
    };

    const suspiciousCount = fraudLogs.filter(
        (l) => l.is_suspicious && !l.resolved,
    ).length;

    const filteredFraudLogs = fraudLogs.filter((l) => {
        if (fraudFilter === "suspicious") return l.is_suspicious && !l.resolved;
        if (fraudFilter === "resolved") return l.resolved;
        return true;
    });

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 pb-12 page-enter">
            <div className="w-full max-w-5xl">
                <div className="animate-fade-in mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                        Admin Panel
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage articles, categories, and fraud detection.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 animate-fade-in-up">
                    <Button
                        variant={tab === "articles" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTab("articles")}
                    >
                        Articles ({articles.length})
                    </Button>
                    <Button
                        variant={tab === "categories" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTab("categories")}
                    >
                        Categories ({categories.length})
                    </Button>
                    <Button
                        variant={tab === "fraud" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTab("fraud")}
                        className="relative"
                    >
                        Fraud Logs
                        {suspiciousCount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                                {suspiciousCount}
                            </span>
                        )}
                    </Button>
                </div>

                {/* ─── Articles ─── */}
                {tab === "articles" && (
                    <>
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
                        <div className="max-w-md mx-auto w-full">
                            <FormError message={error} />
                        </div>
                        {!loading && !error && articles.length === 0 && (
                            <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-card animate-fade-in-up">
                                <div className="text-5xl mb-4">📋</div>
                                <h3 className="text-xl font-bold text-muted-foreground">
                                    No Articles
                                </h3>
                            </div>
                        )}
                        {articles.length > 0 && (
                            <div className="space-y-3">
                                {articles.map((article, i) => (
                                    <Card
                                        key={article.id}
                                        className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)} ${!article.is_approved ? "border-yellow-500/30 bg-yellow-500/5" : ""}`}
                                    >
                                        <CardContent className="p-4 flex gap-4 items-center">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                                        📸
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-bold truncate">
                                                        {article.title}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${article.is_approved ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}
                                                    >
                                                        {article.is_approved
                                                            ? "Approved"
                                                            : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="font-semibold text-foreground">
                                                        $
                                                        {article.price.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                    {getCategoryName(
                                                        article.category_id,
                                                    ) && (
                                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                                            {getCategoryName(
                                                                article.category_id,
                                                            )}
                                                        </span>
                                                    )}
                                                    <span>
                                                        Seller #
                                                        {article.seller_id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                {!article.is_approved && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleApprove(
                                                                article.id,
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading ===
                                                            article.id
                                                        }
                                                        className="transition-all-smooth hover:scale-105"
                                                    >
                                                        {actionLoading ===
                                                        article.id
                                                            ? "..."
                                                            : "Approve"}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDeleteArticle(
                                                            article.id,
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        article.id
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
                        {totalArticles > 0 &&
                            Math.ceil(totalArticles / articleLimit) > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-6 animate-fade-in-up">
                                    <Button
                                        variant="outline"
                                        disabled={articlePage === 1}
                                        onClick={() =>
                                            setArticlePage((p) =>
                                                Math.max(1, p - 1),
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {articlePage} of{" "}
                                        {Math.ceil(
                                            totalArticles / articleLimit,
                                        )}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={
                                            articlePage >=
                                            Math.ceil(
                                                totalArticles / articleLimit,
                                            )
                                        }
                                        onClick={() =>
                                            setArticlePage((p) =>
                                                Math.min(
                                                    Math.ceil(
                                                        totalArticles /
                                                            articleLimit,
                                                    ),
                                                    p + 1,
                                                ),
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                    </>
                )}

                {/* ─── Categories ─── */}
                {tab === "categories" && (
                    <div className="space-y-6">
                        <Card className="animate-fade-in-up shadow-lg">
                            <CardHeader>
                                <CardTitle>Add Category</CardTitle>
                                <CardDescription>
                                    Create a new category for organizing
                                    articles
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleCreateCategory}
                                    className="flex flex-col sm:flex-row gap-3"
                                >
                                    <Input
                                        value={newCatName}
                                        onChange={(e) =>
                                            setNewCatName(e.target.value)
                                        }
                                        placeholder="Category name *"
                                        required
                                        className="flex-1 transition-all-smooth"
                                    />
                                    <Input
                                        value={newCatDesc}
                                        onChange={(e) =>
                                            setNewCatDesc(e.target.value)
                                        }
                                        placeholder="Description (optional)"
                                        className="flex-1 transition-all-smooth"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={catLoading}
                                        className="transition-all-smooth hover:scale-105"
                                    >
                                        {catLoading ? "..." : "Add"}
                                    </Button>
                                </form>
                                <div className="mt-2">
                                    <FormError message={catError} />
                                </div>
                            </CardContent>
                        </Card>
                        {categories.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-muted rounded-xl bg-card animate-fade-in-up">
                                <div className="text-5xl mb-4">🏷️</div>
                                <h3 className="text-xl font-bold text-muted-foreground">
                                    No Categories
                                </h3>
                                <p className="text-sm text-muted-foreground/70 mt-1">
                                    Create your first category above.
                                </p>
                            </div>
                        )}
                        {categories.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((cat, i) => (
                                    <Card
                                        key={cat.id}
                                        className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                                    >
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                                                {cat.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">
                                                    {cat.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {cat.description ||
                                                        "No description"}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleDeleteCategory(cat.id)
                                                }
                                                className="text-destructive hover:text-destructive transition-all-smooth flex-shrink-0"
                                            >
                                                ✕
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Fraud Logs ─── */}
                {tab === "fraud" && (
                    <div className="space-y-6">
                        {/* Filter pills */}
                        <div className="flex gap-2 animate-fade-in-up">
                            <Button
                                variant={
                                    fraudFilter === "suspicious"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setFraudFilter("suspicious")}
                            >
                                🚨 Suspicious (
                                {
                                    fraudLogs.filter(
                                        (l) => l.is_suspicious && !l.resolved,
                                    ).length
                                }
                                )
                            </Button>
                            <Button
                                variant={
                                    fraudFilter === "all"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setFraudFilter("all")}
                            >
                                All ({fraudLogs.length})
                            </Button>
                            <Button
                                variant={
                                    fraudFilter === "resolved"
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => setFraudFilter("resolved")}
                            >
                                ✓ Resolved (
                                {fraudLogs.filter((l) => l.resolved).length})
                            </Button>
                        </div>

                        {filteredFraudLogs.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-muted rounded-xl bg-card animate-fade-in-up">
                                <div className="text-5xl mb-4">🛡️</div>
                                <h3 className="text-xl font-bold text-muted-foreground">
                                    {fraudFilter === "suspicious"
                                        ? "No Suspicious Activity"
                                        : "No Fraud Logs"}
                                </h3>
                                <p className="text-sm text-muted-foreground/70 mt-1">
                                    {fraudFilter === "suspicious"
                                        ? "All clear! No unresolved suspicious activity detected."
                                        : "Fraud logs will appear here when price changes are checked."}
                                </p>
                            </div>
                        )}

                        {filteredFraudLogs.length > 0 && (
                            <div className="space-y-3">
                                {filteredFraudLogs.map((log, i) => (
                                    <Card
                                        key={log.id}
                                        className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)} ${log.is_suspicious && !log.resolved ? "border-destructive/30 bg-destructive/5" : ""}`}
                                    >
                                        <CardContent className="p-4 flex gap-4 items-center">
                                            <div
                                                className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${log.is_suspicious ? (log.resolved ? "bg-muted" : "bg-destructive/10") : "bg-green-500/10"}`}
                                            >
                                                {log.is_suspicious
                                                    ? log.resolved
                                                        ? "✅"
                                                        : "🚨"
                                                    : "✓"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-bold text-sm">
                                                        Article #
                                                        {log.article_id}
                                                    </h3>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.is_suspicious ? (log.resolved ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive") : "bg-green-500/10 text-green-600"}`}
                                                    >
                                                        {log.is_suspicious
                                                            ? log.resolved
                                                                ? "Resolved"
                                                                : "Suspicious"
                                                            : "OK"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.reason}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>
                                                        $
                                                        {log.old_price.toFixed(
                                                            2,
                                                        )}{" "}
                                                        → $
                                                        {log.new_price.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${log.change_pct > 50 ? "text-destructive" : ""}`}
                                                    >
                                                        (
                                                        {log.change_pct.toFixed(
                                                            1,
                                                        )}
                                                        %)
                                                    </span>
                                                    <span>
                                                        Seller #{log.seller_id}
                                                    </span>
                                                    <span>
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {log.is_suspicious &&
                                                !log.resolved && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleResolveFraud(
                                                                log.id,
                                                            )
                                                        }
                                                        className="transition-all-smooth hover:scale-105 flex-shrink-0"
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
