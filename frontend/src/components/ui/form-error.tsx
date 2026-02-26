import { AlertCircle } from "lucide-react";

export function FormError({ message }: { message?: string | null }) {
    if (!message) return null;

    return (
        <div className="flex flex-row items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-scale-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="flex-1 font-medium">{message}</p>
        </div>
    );
}
