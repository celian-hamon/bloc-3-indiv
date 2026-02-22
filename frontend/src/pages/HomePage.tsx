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
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 gap-8">
            <div className="w-full max-w-6xl">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-primary">
                    Catalog
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    Browse items currently approved and available for sale on
                    the platform.
                </p>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-muted h-10 w-10"></div>
                            <div className="flex-1 space-y-6 py-1">
                                <div className="h-2 bg-muted rounded"></div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-2 bg-muted rounded col-span-2"></div>
                                        <div className="h-2 bg-muted rounded col-span-1"></div>
                                    </div>
                                    <div className="h-2 bg-muted rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive font-semibold rounded-md text-center max-w-md mx-auto">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-muted rounded-xl bg-card">
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
                        {items.map((item) => (
                            <Card
                                key={item.id}
                                className="flex flex-col hover:shadow-lg transition-shadow duration-300 group overflow-hidden border-border/50"
                            >
                                <div className="aspect-video w-full bg-muted overflow-hidden relative">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 font-medium">
                                            <span className="text-4xl mb-2 block">
                                                📸
                                            </span>
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                        ${item.price.toFixed(2)}
                                    </div>
                                </div>

                                <CardContent className="p-5 flex-1 flex flex-col bg-card/50">
                                    <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex-1 line-clamp-3 mb-4 leading-relaxed">
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
