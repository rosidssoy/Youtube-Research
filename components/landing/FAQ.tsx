"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        question: "What is VibeCloned?",
        answer: "VibeCloned is a powerful competitor research tool designed for YouTube creators. It allows you to extract, analyze, and replicate the success strategies of top performing channels in your niche."
    },
    {
        question: "How does it work?",
        answer: "Simply paste a YouTube video or channel URL into the input field. VibeCloned fetches public data from YouTube, analyzes it, and presents you with actionable insights like transcripts, tags, and performance metrics."
    },
    {
        question: "What are AI Analysis Prompts?",
        answer: "Our AI Prompts library provides ready-made prompts designed to analyze competitor data with ChatGPT, Claude, or Gemini. Simply copy a prompt, paste your extracted data, and get instant insights on title patterns, thumbnail strategies, and content structures."
    },
    {
        question: "How do I use the AI Prompts?",
        answer: "After logging in, navigate to the AI Prompts page from the navigation bar. Browse prompts by category, click 'Copy Prompt', then paste it into your preferred AI assistant along with your extracted competitor data. The AI will analyze and provide actionable insights."
    },
    {
        question: "What data can I extract?",
        answer: "You can extract comprehensive metadata including video titles, descriptions, tags, thumbnails, view counts, like counts, upload dates, and full video transcripts (scripts)."
    },
    {
        question: "Is it free to use?",
        answer: "Yes, VibeCloned offers a free tier that allows you to analyze videos and channels. We may introduce premium features for advanced bulk analysis in the future."
    },
    {
        question: "Can I export the data?",
        answer: "Absolutely! You can export all analyzed data as a JSON file with a single click, making it easy to import into other tools or save for later."
    },
    {
        question: "Is this legal?",
        answer: "Yes. VibeCloned only accesses and aggregates publicly available data from YouTube. We do not access private videos or personal account information."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-20 w-full bg-secondary/20">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">
                        Got questions? We've got answers.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-card border border-border rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left font-medium hover:bg-secondary/50 transition-colors"
                            >
                                {faq.question}
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
