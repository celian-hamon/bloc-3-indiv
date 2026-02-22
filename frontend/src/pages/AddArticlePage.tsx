import { useState, useRef } from "react";
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setImagePreview(dataUrl);
            setImageUrl(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleUrlInput = (url: string) => {
        setImageUrl(url);
        if (url.match(/^https?:\/\/.+/)) {
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    };

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
        <div className="min-h-screen bg-background flex flex-col items-center p-4 py-12 page-enter">
            <Card className="w-full max-w-lg shadow-xl animate-scale-in">
                <CardHeader>
                    <CardTitle className="text-2xl gradient-text">
                        List a New Item
                    </CardTitle>
                    <CardDescription>
                        Enter the details of the item you want to sell. Items
                        start as unapproved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md animate-scale-in">
                                {error}
                            </div>
                        )}

                        {/* Image Upload Zone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Product Image
                            </label>
                            <div
                                className={`dropzone rounded-xl p-6 text-center cursor-pointer transition-all-smooth ${isDragging ? "active" : ""}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <div className="relative group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full max-h-48 object-contain rounded-lg animate-scale-in"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                Click to change
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 animate-fade-in">
                                        <div className="text-4xl mb-3">📸</div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Drag & drop an image here, or click
                                            to browse
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">
                                            PNG, JPG, WEBP up to 10MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    type="url"
                                    value={
                                        imageUrl.startsWith("data:")
                                            ? ""
                                            : imageUrl
                                    }
                                    onChange={(e) =>
                                        handleUrlInput(e.target.value)
                                    }
                                    placeholder="Or paste an image URL..."
                                    className="text-xs transition-all-smooth"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Title *
                            </label>
                            <Input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Vintage Camera"
                                className="transition-all-smooth focus:ring-2 focus:ring-primary/40"
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
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all-smooth"
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
                                    className="transition-all-smooth"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Shipping ($)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={shippingCost}
                                    onChange={(e) =>
                                        setShippingCost(e.target.value)
                                    }
                                    className="transition-all-smooth"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Category ID (optional)
                            </label>
                            <Input
                                type="number"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                placeholder="E.g., 1"
                                className="transition-all-smooth"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2 transition-all-smooth hover:scale-[1.02]"
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
