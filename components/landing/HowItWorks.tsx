"use client";

import { motion } from "framer-motion";
import { Database, Bot, Clapperboard, Sparkles } from "lucide-react";

const steps = [
    {
        icon: Database,
        title: "Step 1: Extract Data",
        description: "Get titles, descriptions, transcripts, and thumbnails. Export all complete competitor data as JSON in seconds."
    },
    {
        icon: Bot,
        title: "Step 2: Analyze with AI",
        description: "Upload JSON to Claude, ChatGPT, or Gemini. Let AI decode title patterns, thumbnail psychology, and script structures."
    },
    {
        icon: Clapperboard,
        title: "Step 3: Create Content",
        description: "Use these insights to generate your content. Have AI create titles, script outlines, and thumbnail concepts that replicate success."
    },
];

export default function HowItWorks() {
    return (
        <section className="py-20 w-full bg-secondary/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            <div className="container max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Turn competitor data into your unfair advantage in three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background border border-border shadow-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Works with: <span className="text-foreground font-semibold">Claude</span> | <span className="text-foreground font-semibold">ChatGPT</span> | <span className="text-foreground font-semibold">Gemini</span> | Any AI
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
