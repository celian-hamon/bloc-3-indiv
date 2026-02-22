import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, CardContent } from "../components/ui/card";

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

export const HomePage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get("/articles/")
            .then((res) => {
                setItems(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to fetch articles from API.");
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 gap-8 page-enter">
            <div className="w-full max-w-6xl">
                <div className="animate-fade-in mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-primary">
                        Catalog
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Browse items currently approved and available for sale
                        on the platform.
                    </p>
                </div>

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

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive font-semibold rounded-md text-center max-w-md mx-auto animate-scale-in">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-card animate-fade-in-up">
                        <div className="text-6xl mb-4 animate-float">📦</div>
                        <h3 className="text-2xl font-bold text-muted-foreground">
                            No Items Available
                        </h3>
                        <p className="mt-2 text-muted-foreground/80">
                            Check back later or register as a seller to list
                            items!
                        </p>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item, i) => (
                            <Card
                                key={item.id}
                                className={`flex flex-col card-hover overflow-hidden border-border/50 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                            >
                                <div className="aspect-video w-full bg-muted overflow-hidden relative group">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
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
                                            +${item.shipping_cost.toFixed(2)}{" "}
                                            shipping
                                        </div>
                                    ) : null}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
