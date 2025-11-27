"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Youtube, Layers, Moon, Sun, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import VideoExtractor from "@/components/VideoExtractor";
import ChannelExtractor from "@/components/ChannelExtractor";
import ProfileMenu from "@/components/ProfileMenu";
import Features from "@/components/landing/Features";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import AppNavbar from "@/components/AppNavbar";
import HowItWorks from "@/components/landing/HowItWorks";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"video" | "channel">("video");
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <AppNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground mb-4">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>The Ultimate Competitor Research Tool</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Clone Any YouTube Channel's <br />
            <span className="text-primary">Success Formula</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Extract competitor video data, analyze their strategy, and replicate what works for your channel.
          </p>
        </div>

        {/* Extraction Tool */}
        <div className="max-w-4xl mx-auto mt-12 relative z-10">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-2xl shadow-primary/5">
            {/* Tabs */}
            <div className="flex p-1 bg-secondary/50 rounded-xl w-full max-w-md mx-auto mb-8">
              <button
                onClick={() => setActiveTab("video")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeTab === "video"
                    ? "bg-background shadow-sm text-foreground ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Youtube className="w-4 h-4" />
                Single Video
              </button>
              <button
                onClick={() => setActiveTab("channel")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeTab === "channel"
                    ? "bg-background shadow-sm text-foreground ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="w-4 h-4" />
                Bulk Channel
              </button>
            </div>

            {/* Tool Content */}
            <div className="min-h-[300px] px-4 pb-4">
              <AnimatePresence mode="wait">
                {activeTab === "video" ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VideoExtractor />
                  </motion.div>
                ) : (
                  <motion.div
                    key="channel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChannelExtractor />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Features />
      <FAQ />
      <Footer />
    </main>
  );
}
