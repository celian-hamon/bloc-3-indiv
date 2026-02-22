import { useState, useRef, useEffect } from "react";
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

interface Category {
    id: number;
    name: string;
    description: string | null;
}

export const AddArticlePage = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [shippingCost, setShippingCost] = useState("0");
    const [images, setImages] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/categories/")
            .then((res) => setCategories(res.data))
            .catch(() => {});
    }, []);

    const addImage = (dataUrl: string) => {
        setImages((prev) => [...prev, dataUrl]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                addImage(dataUrl);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // --- Photo reorder drag & drop ---
    const handlePhotoDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handlePhotoDragEnter = (index: number) => {
        setDragOverIndex(index);
    };

    const handlePhotoDragEnd = () => {
        if (
            dragIndex !== null &&
            dragOverIndex !== null &&
            dragIndex !== dragOverIndex
        ) {
            setImages((prev) => {
                const copy = [...prev];
                const [moved] = copy.splice(dragIndex, 1);
                copy.splice(dragOverIndex, 0, moved);
                return copy;
            });
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const imageUrl = images.length > 0 ? images[0] : null;

            await api.post("/articles/", {
                title,
                description: description || null,
                price: parseFloat(price),
                shipping_cost: parseFloat(shippingCost) || 0,
                image_url: imageUrl,
                category_id: categoryId ? parseInt(categoryId, 10) : null,
            });

            setSuccess(true);
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

    if (success) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-24 page-enter">
                <Card className="w-full max-w-md shadow-xl animate-scale-in text-center">
                    <CardHeader>
                        <div className="text-5xl mb-2">✅</div>
                        <CardTitle className="text-2xl">
                            Item Submitted!
                        </CardTitle>
                        <CardDescription>
                            Your item has been submitted and is now pending
                            admin approval. Once approved, it will appear in the
                            catalog.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3 justify-center">
                        <Button onClick={() => navigate("/")} variant="outline">
                            Browse Catalog
                        </Button>
                        <Button
                            onClick={() => {
                                setSuccess(false);
                                setTitle("");
                                setDescription("");
                                setPrice("");
                                setImages([]);
                                setCategoryId("");
                            }}
                        >
                            List Another
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 pb-12 page-enter">
            <Card className="w-full max-w-lg shadow-xl animate-scale-in">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">
                        List a New Item
                    </CardTitle>
                    <CardDescription>
                        Enter the details of the item you want to sell.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md animate-scale-in">
                                {error}
                            </div>
                        )}

                        {/* Multi-Image Upload with Drag & Drop Reorder */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Product Images
                            </label>

                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((img, index) => (
                                        <div
                                            key={`${index}-${img.slice(-20)}`}
                                            draggable
                                            onDragStart={() =>
                                                handlePhotoDragStart(index)
                                            }
                                            onDragEnter={() =>
                                                handlePhotoDragEnter(index)
                                            }
                                            onDragEnd={handlePhotoDragEnd}
                                            onDragOver={(e) =>
                                                e.preventDefault()
                                            }
                                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                                                dragIndex === index
                                                    ? "opacity-40 scale-95"
                                                    : dragOverIndex === index
                                                      ? "border-primary ring-2 ring-primary/30 scale-105"
                                                      : "border-border"
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover pointer-events-none"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                    className="bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:scale-110 transition-transform"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            {index === 0 && (
                                                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                                    Main
                                                </span>
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                                {index + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {images.length > 1 && (
                                <p className="text-xs text-muted-foreground/70">
                                    💡 Drag photos to reorder. First image is
                                    the main listing photo.
                                </p>
                            )}

                            {/* Dropzone */}
                            <div
                                className={`dropzone rounded-xl p-6 text-center cursor-pointer transition-all-smooth ${isDragging ? "active" : ""}`}
                                onDrop={handleFileDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="py-4 animate-fade-in">
                                    <div className="text-3xl mb-2">📸</div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {images.length > 0
                                            ? "Add more images — drag & drop or click"
                                            : "Drag & drop images here, or click to browse"}
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        PNG, JPG, WEBP — select multiple files
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileSelect(e.target.files)
                                    }
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
                                Category
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all-smooth"
                            >
                                <option value="">No category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2 transition-all-smooth hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading
                                ? "Submitting..."
                                : `List Item${images.length > 0 ? ` (${images.length} photo${images.length > 1 ? "s" : ""})` : ""}`}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
