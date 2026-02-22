import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";

export const AddArticlePage = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [shippingCost, setShippingCost] = useState("0");
    const [imageUrl, setImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/articles/", {
                title,
                description: description || null,
                price: parseFloat(price),
                shipping_cost: parseFloat(shippingCost) || 0,
                image_url: imageUrl || null,
                category_id: categoryId ? parseInt(categoryId, 10) : null,
            });

            navigate("/");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: unknown } } };
            setError(
                error.response?.data?.detail
                    ? JSON.stringify(error.response.data.detail)
                    : "Failed to create article.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 py-12">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">
                        List a New Item
                    </CardTitle>
                    <CardDescription>
                        Enter the details of the item you want to sell. Items
                        start as unapproved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Title *
                            </label>
                            <Input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Vintage Camera"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Describe your item..."
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Price ($) *
                                </label>
                                <Input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="99.99"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Shipping Cost ($)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={shippingCost}
                                    onChange={(e) =>
                                        setShippingCost(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Image URL (Optional)
                            </label>
                            <Input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Category ID (Optional)
                            </label>
                            <Input
                                type="number"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                placeholder="E.g., 1"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "List Item"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
