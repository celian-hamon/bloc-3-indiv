import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("buyer");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await api.post("/auth/register", {
                email,
                password,
                full_name: fullName,
                role,
            });

            // Auto login after register
            const params = new URLSearchParams();
            params.append("username", email);
            params.append("password", password);

            const response = await api.post(
                "/auth/login/access-token",
                params,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );

            login(response.data.access_token);
            navigate("/");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(
                typeof error.response?.data?.detail === "string"
                    ? error.response.data.detail
                    : "Registration failed. Please check your inputs.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 page-enter">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl animate-float" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-xl animate-scale-in">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl gradient-text">
                        Create an Account
                    </CardTitle>
                    <CardDescription>
                        Join our collector marketplace
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md animate-scale-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Full Name (Optional)
                            </label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
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
                                Password
                            </label>
                            <Input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="transition-all-smooth focus:ring-2 focus:ring-primary/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                I want to be a
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all-smooth"
                            >
                                <option value="buyer">Buyer</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full transition-all-smooth hover:scale-[1.02]"
                        >
                            Create account
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:underline transition-colors"
                        >
                            Sign in Instead
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
