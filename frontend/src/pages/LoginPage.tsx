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
import { FormError } from "../components/ui/form-error";

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
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
                error.response?.data?.detail ||
                    "Invalid login credentials. Please try again.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24 page-enter">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-float" />
            </div>

            <Card className="w-full max-w-sm relative z-10 shadow-xl animate-scale-in">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <FormError message={error} />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="transition-all-smooth focus:ring-2 focus:ring-primary/40"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full transition-all-smooth hover:scale-[1.02]"
                        >
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-primary hover:underline transition-colors"
                        >
                            Create an account
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
