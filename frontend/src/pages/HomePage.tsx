import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { FormError } from "../components/ui/form-error";

interface Item {
    id: number;
    title: string;
    description: string;
    price: number;
    image_url: string;
    seller_id: number;
    is_approved: boolean;
    category_id?: number;
    shipping_cost?: number;
}

interface Category {
    id: number;
    name: string;
    description: string | null;
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

export const HomePage = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 12;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories once
    useEffect(() => {
        api.get("/categories/")
            .then((res) => setCategories(res.data))
            .catch(() => {});
    }, []);

    // Debounce search input (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch articles when filters change
    const fetchArticles = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory)
            params.set("category_id", String(selectedCategory));
        if (debouncedSearch.trim())
            params.set("search", debouncedSearch.trim());

        params.set("skip", String((page - 1) * limit));
        params.set("limit", String(limit));

        const qs = params.toString() ? `?${params.toString()}` : "";

        api.get(`/articles/${qs}`)
            .then((res) => {
                setItems(res.data.items);
                setTotalItems(res.data.total);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch articles from API.");
                setLoading(false);
            });
    }, [selectedCategory, debouncedSearch, page]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return null;
        return categories.find((c) => c.id === categoryId)?.name || null;
    };

    const totalPages = Math.ceil(totalItems / limit);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 gap-6 page-enter">
            <div className="w-full max-w-6xl">
                <div className="animate-fade-in mb-6">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-primary">
                        {t("home.title")}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t("home.subtitle")}
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search items by name or description..."
                            className="pl-10 transition-all-smooth focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                </div>

                {/* Category Pills */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up stagger-1">
                        <Button
                            variant={
                                selectedCategory === null
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => {
                                setSelectedCategory(null);
                                setPage(1);
                            }}
                            className="transition-all-smooth hover:scale-105"
                        >
                            {t("home.all_categories")}
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={
                                    selectedCategory === cat.id
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setPage(1);
                                }}
                                className="transition-all-smooth hover:scale-105"
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-xl border border-border/50 overflow-hidden animate-fade-in-up stagger-${i + 1}`}
                            >
                                <div className="aspect-video w-full animate-shimmer" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 w-3/4 rounded animate-shimmer" />
                                    <div className="h-3 w-full rounded animate-shimmer" />
                                    <div className="h-3 w-2/3 rounded animate-shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                <div className="max-w-md mx-auto w-full">
                    <FormError message={error} />
                </div>

                {/* Empty */}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-card animate-fade-in-up">
                        <div className="text-6xl mb-4 animate-float">📦</div>
                        <h3 className="text-2xl font-bold text-muted-foreground">
                            {t("home.no_items")}
                        </h3>
                        <p className="mt-2 text-muted-foreground/80">
                            {debouncedSearch
                                ? `No results for "${debouncedSearch}".`
                                : selectedCategory
                                  ? "No items in this category yet."
                                  : "Check back later or register as a seller to list items!"}
                        </p>
                        {(debouncedSearch || selectedCategory) && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory(null);
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Results */}
                {!loading && items.length > 0 && (
                    <>
                        <p className="text-sm text-muted-foreground mb-4 animate-fade-in">
                            {totalItems} item{totalItems !== 1 ? "s" : ""} found
                            {debouncedSearch ? ` for "${debouncedSearch}"` : ""}
                            {selectedCategory
                                ? ` in ${getCategoryName(selectedCategory) || "category"}`
                                : ""}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map((item, i) => (
                                <Link
                                    key={item.id}
                                    to={`/article/${item.id}`}
                                    className="block h-full"
                                >
                                    <Card
                                        className={`flex flex-col h-full card-hover overflow-hidden border-border/50 cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                                    >
                                        <div className="aspect-video w-full bg-muted overflow-hidden relative group">
                                            {getFirstImage(item.image_url) ? (
                                                <img
                                                    src={
                                                        getFirstImage(
                                                            item.image_url,
                                                        )!
                                                    }
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 font-medium">
                                                    <span className="text-4xl mb-2 block animate-float">
                                                        📸
                                                    </span>
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                                ${item.price.toFixed(2)}
                                            </div>
                                            {item.shipping_cost ? (
                                                <div className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
                                                    +$
                                                    {item.shipping_cost.toFixed(
                                                        2,
                                                    )}{" "}
                                                    shipping
                                                </div>
                                            ) : null}
                                            {getCategoryName(
                                                item.category_id,
                                            ) && (
                                                <div className="absolute top-3 left-3 glass px-2 py-0.5 rounded text-xs font-semibold">
                                                    {getCategoryName(
                                                        item.category_id,
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <CardContent className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground flex-1 line-clamp-3 leading-relaxed">
                                                {item.description ||
                                                    "No description provided."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 animate-fade-in-up">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
