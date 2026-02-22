import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="w-full h-16 border-b border-border bg-background flex items-center justify-between px-6 md:px-12 fixed top-0 z-50">
            <div className="flex items-center gap-6">
                <Link
                    to="/"
                    className="text-xl font-bold tracking-tight text-primary"
                >
                    Collector
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="hidden md:flex text-sm text-muted-foreground mr-4">
                            Welcome,{" "}
                            <span className="font-semibold text-foreground ml-1">
                                {user.full_name || user.email}
                            </span>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs uppercase tracking-wider">
                                {user.role}
                            </span>
                        </div>
                        {(user.role === "seller" || user.role === "admin") && (
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/new">Add Item</Link>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={logout}>
                            Log out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/login">Sign in</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link to="/register">Sign up</Link>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
};
