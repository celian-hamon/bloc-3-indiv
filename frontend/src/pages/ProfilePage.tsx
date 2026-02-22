import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

export const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || "");
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const payload: Record<string, unknown> = {
                full_name: fullName || null,
                email,
            };
            if (password) {
                payload.password = password;
            }

            await api.put("/users/me", payload);
            setSuccess("Profile updated successfully!");
            setPassword("");
            // Reload user data
            window.location.reload();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(
                error.response?.data?.detail || "Failed to update profile.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (
            !confirm(
                "Are you sure you want to delete your account? This action is irreversible.",
            )
        )
            return;
        try {
            logout();
            navigate("/");
        } catch {
            setError("Failed to delete account.");
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-24 pb-12 page-enter">
            <div className="w-full max-w-2xl space-y-8">
                {/* Profile Header */}
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                        My Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Account Info Card */}
                <Card className="animate-fade-in-up shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary animate-pulse-glow">
                                {(user.full_name || user.email)
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    {user.full_name || "No name set"}
                                </CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Edit Form */}
                <Card className="animate-fade-in-up stagger-2 shadow-lg">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>
                            Update your personal information below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md animate-scale-in">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 bg-green-500/10 text-green-600 text-sm rounded-md animate-scale-in">
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Full Name
                                </label>
                                <Input
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Your full name"
                                    className="transition-all-smooth focus:ring-2 focus:ring-primary/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="transition-all-smooth focus:ring-2 focus:ring-primary/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    New Password (leave blank to keep current)
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="transition-all-smooth focus:ring-2 focus:ring-primary/40"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full transition-all-smooth"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="animate-fade-in-up stagger-4 border-destructive/30 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions on your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated
                            data.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteAccount}
                            className="transition-all-smooth"
                        >
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
