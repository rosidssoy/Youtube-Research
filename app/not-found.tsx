import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
                <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            <p className="text-muted-foreground max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all"
            >
                Return Home
            </Link>
        </div>
    );
}
