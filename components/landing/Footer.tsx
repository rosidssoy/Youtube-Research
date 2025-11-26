import { Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card py-12">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Youtube className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">VibeCloned</span>
                </div>

                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                        Contact
                    </Link>
                </div>

                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} VibeCloned. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
