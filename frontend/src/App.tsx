import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Item {
    id: number;
    title: string;
    description: string;
    price: number;
}

function App() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("https://celianhamon.fr/api/v1/items/")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch API");
                return res.json();
            })
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 py-12 gap-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to Collector App</CardTitle>
                    <CardDescription>
                        Frontend successfully connected to the API 🚀
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="search"
                            className="text-sm font-medium leading-none"
                        >
                            Test Input Component
                        </label>
                        <Input id="search" placeholder="Enter something..." />
                    </div>
                    <Button className="w-full">Get Started</Button>
                </CardContent>
            </Card>

            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">
                    Latest Items from API
                </h2>

                {loading && (
                    <p className="text-muted-foreground">Loading items...</p>
                )}
                {error && (
                    <p className="text-destructive font-semibold">
                        Error: {error}
                    </p>
                )}

                {!loading && !error && items.length === 0 && (
                    <p className="text-muted-foreground">
                        No items currently available in the database.
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <Card key={item.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    {item.title}
                                </CardTitle>
                                <CardDescription className="text-lg font-bold text-primary">
                                    ${item.price.toFixed(2)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-foreground/80">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
