import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../components/ui/carousel";
import ReactMarkdown from "react-markdown";

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

export const ArticlePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [article, setArticle] = useState<Article | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chatLoading, setChatLoading] = useState(false);

    const handleChatClick = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (article?.seller_id === user.id) {
            alert("You cannot chat with yourself about your own item");
            return;
        }

        setChatLoading(true);
        try {
            const res = await api.post("/chat/conversations", {
                article_id: article?.id,
            });
            navigate(`/chat/${res.data.id}`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            alert(error.response?.data?.detail || "Failed to start chat");
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        api.get("/categories/")
            .then((res) => setCategories(res.data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        api.get(`/articles/${id}`)
            .then((res) => {
                setArticle(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Article not found.");
                setLoading(false);
            });
    }, [id]);

    const getCategoryName = (catId: number | null) => {
        if (!catId) return null;
        return categories.find((c) => c.id === catId)?.name || null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 page-enter">
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="aspect-square rounded-2xl animate-shimmer" />
                        <div className="space-y-4 py-4">
                            <div className="h-8 w-3/4 rounded animate-shimmer" />
                            <div className="h-4 w-1/3 rounded animate-shimmer" />
                            <div className="h-4 w-full rounded animate-shimmer" />
                            <div className="h-4 w-full rounded animate-shimmer" />
                            <div className="h-4 w-2/3 rounded animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-24 page-enter">
                <div className="text-center animate-scale-in">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold mb-2">
                        Article Not Found
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        {error ||
                            "This article doesn't exist or has been removed."}
                    </p>
                    <Button asChild>
                        <Link to="/">Back to Catalog</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const totalPrice = article.price + (article.shipping_cost || 0);

    const getImages = (url: string | null): string[] => {
        if (!url) return [];
        try {
            if (url.startsWith("[")) {
                return JSON.parse(url);
            }
        } catch {
            // fallback
        }
        return [url];
    };

    const images = getImages(article.image_url);

    return (
        <div className="min-h-screen bg-background p-4 pt-24 pb-12 page-enter">
            <div className="max-w-5xl mx-auto">
                {/* Back button */}
                <div className="mb-6 animate-fade-in">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="transition-all-smooth"
                    >
                        <Link to="/">← Back to Catalog</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Image Carousel */}
                    <div className="animate-fade-in-up">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-lg relative flex items-center justify-center">
                            {images.length > 0 ? (
                                images.length === 1 ? (
                                    <img
                                        src={images[0]}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Carousel className="w-full h-full">
                                        <CarouselContent>
                                            {images.map((imgUrl, index) => (
                                                <CarouselItem key={index}>
                                                    <div className="aspect-square w-full">
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${article.title} - Image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                                            <CarouselPrevious className="relative left-0 translate-y-0 shadow-md bg-white border border-border text-foreground hover:bg-muted" />
                                        </div>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <CarouselNext className="relative right-0 translate-y-0 shadow-md bg-white border border-border text-foreground hover:bg-muted" />
                                        </div>
                                        {/* Pagination indicator dots */}
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                                            {images.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-black/40 shadow-sm"
                                                />
                                            ))}
                                        </div>
                                    </Carousel>
                                )
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                                    <span className="text-6xl mb-3 animate-float">
                                        📸
                                    </span>
                                    <span className="text-sm font-medium">
                                        No Image
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-6 animate-fade-in-up stagger-2">
                        {/* Title & Status */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        article.is_approved
                                            ? "bg-green-500/10 text-green-600"
                                            : "bg-yellow-500/10 text-yellow-600"
                                    }`}
                                >
                                    {article.is_approved
                                        ? "✓ Approved"
                                        : "⏳ Pending Approval"}
                                </span>
                                {getCategoryName(article.category_id) && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                        {getCategoryName(article.category_id)}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                {article.title}
                            </h1>
                        </div>

                        {/* Price Card */}
                        <Card className="shadow-md">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-primary">
                                        ${article.price.toFixed(2)}
                                    </span>
                                </div>
                                {article.shipping_cost > 0 && (
                                    <div className="flex justify-between text-sm text-muted-foreground border-t border-border/50 pt-3">
                                        <span>Shipping</span>
                                        <span>
                                            +${article.shipping_cost.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-3">
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        className="w-full gap-2 shadow-sm font-bold tracking-wide"
                                        size="lg"
                                        disabled={chatLoading}
                                        onClick={handleChatClick}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        {chatLoading
                                            ? "Loading..."
                                            : "Chat & Buy"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <div className="animate-fade-in-up stagger-3">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                Description
                            </h2>
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                    {article.description ||
                                        "No description provided for this item."}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-4 animate-fade-in-up stagger-4">
                            <div className="rounded-lg border border-border/50 p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    Seller
                                </p>
                                <p className="font-semibold">
                                    #{article.seller_id}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/50 p-4">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    Item ID
                                </p>
                                <p className="font-semibold">#{article.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
