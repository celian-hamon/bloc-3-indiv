import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-24 page-enter">
            <div className="text-center max-w-md animate-scale-in">
                <div className="text-8xl font-extrabold text-primary/20 mb-2 animate-float">
                    404
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-3">
                    Page Not Found
                </h1>
                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button
                        asChild
                        className="transition-all-smooth hover:scale-105"
                    >
                        <Link to="/">Back to Catalog</Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="transition-all-smooth hover:scale-105"
                    >
                        <Link to="/showcase">About</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
