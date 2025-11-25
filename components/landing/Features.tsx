import { Layers, Zap, Download, Database, FileText, Shield } from "lucide-react";

const features = [
    {
        icon: Layers,
        title: "Bulk Extract",
        description: "Analyze hundreds of videos in minutes. Get a comprehensive view of any channel's performance."
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Get data in seconds. Our optimized engine fetches and processes YouTube data instantly."
    },
    {
        icon: Download,
        title: "Export Data",
        description: "Download your analysis as JSON. Ready for Excel, Google Sheets, or your own database."
    },
    {
        icon: Database,
        title: "Complete Data",
        description: "Get everything: Titles, descriptions, thumbnails, view counts, likes, and upload dates."
    },
    {
        icon: FileText,
        title: "Get Transcripts",
        description: "Extract full video transcripts automatically. Perfect for content repurposing and AI analysis."
    },
    {
        icon: Shield,
        title: "Private & Secure",
        description: "Your research is safe. We don't store your personal data or share your research history."
    }
];

export default function Features() {
    return (
        <section className="py-20 w-full">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Why Use VibeClone?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to reverse-engineer success on YouTube.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
