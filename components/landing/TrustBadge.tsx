import { Check, Star, Users } from "lucide-react";

export default function TrustBadge() {
    return (
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-muted-foreground">

            {/* Trust Indicators */}
            <div className="flex flex-col items-center md:items-start gap-3">
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-primary/20 border border-background flex items-center justify-center">
                                <Users className="w-3 h-3 text-primary" />
                            </div>
                        ))}
                    </div>
                    <span className="font-medium text-foreground">Trusted by 10,000+ Creators</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="flex text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span>"Game changer for my channel"</span>
                </div>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {[
                    "Video Title & Description",
                    "Thumbnail in High Quality",
                    "Full Transcript",
                    "Views, Likes & Stats",
                    "Export as JSON"
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
