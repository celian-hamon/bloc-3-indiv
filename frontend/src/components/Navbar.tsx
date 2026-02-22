import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { MessageSquare, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language.startsWith("fr") ? "en" : "fr";
        i18n.changeLanguage(nextLang);
    };

    return (
        <nav className="w-full h-16 border-b border-border glass flex items-center justify-between px-6 md:px-12 fixed top-0 z-50 transition-all-smooth">
            <div className="flex items-center gap-8">
                <Link
                    to="/"
                    className="text-xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
                >
                    Collector
                </Link>
                <div className="hidden md:flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="transition-all-smooth"
                    >
                        <Link to="/">{t("nav.catalog")}</Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="transition-all-smooth"
                    >
                        <Link to="/showcase">{t("nav.about")}</Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLanguage}
                    className="w-8 h-8 rounded-full"
                    title="Toggle Language"
                >
                    <Globe className="w-4 h-4" />
                </Button>
                {user ? (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="transition-all-smooth"
                        >
                            <Link
                                to="/chat"
                                className="flex items-center gap-2"
                                title="Messages"
                            >
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="transition-all-smooth"
                        >
                            <Link
                                to="/profile"
                                className="flex items-center gap-2"
                            >
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {(user.full_name || user.email)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <span className="hidden md:inline">
                                    {user.full_name || user.email}
                                </span>
                            </Link>
                        </Button>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-wider font-semibold hidden md:inline">
                            {user.role}
                        </span>
                        {(user.role === "seller" || user.role === "admin") && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="transition-all-smooth hover:scale-105"
                            >
                                <Link to="/new">{t("nav.list_item")}</Link>
                            </Button>
                        )}
                        {user.role === "admin" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="transition-all-smooth"
                            >
                                <Link to="/admin">{t("nav.admin")}</Link>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="transition-all-smooth text-muted-foreground hover:text-destructive"
                        >
                            {t("nav.logout")}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="transition-all-smooth"
                        >
                            <Link to="/login">{t("nav.signin")}</Link>
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="transition-all-smooth hover:scale-105"
                        >
                            <Link to="/register">{t("nav.signup")}</Link>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
};
