"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
            <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground max-w-md">
                We encountered an unexpected error. Please try again later.
            </p>
            <button
                onClick={reset}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all"
            >
                Try again
            </button>
        </div>
    );
}
