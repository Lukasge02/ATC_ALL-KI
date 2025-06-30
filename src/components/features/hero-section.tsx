"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Stars, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-primary opacity-10" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full gradient-primary opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="container relative z-10 px-4 mx-auto text-center">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {/* Main Heading */}
          <motion.div variants={ANIMATION_PRESETS.slideUp}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text text-5xl md:text-7xl lg:text-8xl">ALL-KI</span>
              <br />
              <span className="text-foreground text-3xl md:text-5xl lg:text-6xl">Deine KI für den</span>
              <br />
              <span className="gradient-text text-3xl md:text-5xl lg:text-6xl">Alltag</span>
              <span className="text-foreground text-3xl md:text-5xl lg:text-6xl"> - für </span>
              <span className="gradient-text text-3xl md:text-5xl lg:text-6xl">Alles</span>
              <span className="text-foreground text-3xl md:text-5xl lg:text-6xl">.</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div variants={ANIMATION_PRESETS.slideUp}>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Personalisierte KI-Assistenten mit innovativem Widget-System. 
              Erstelle maßgeschneiderte AI-Profile für jeden Lebensbereich.
            </p>
          </motion.div>

          {/* Features Icons */}
          <motion.div 
            className="flex justify-center items-center gap-8 py-6"
            variants={ANIMATION_PRESETS.slideUp}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Schnell</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Stars className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Intelligent</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Personalisiert</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={ANIMATION_PRESETS.slideUp}
          >
            <Button size="xl" variant="gradient" className="group" asChild>
              <Link href="/register">
                <span className="flex items-center">
                  Jetzt kostenlos starten
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="#features">
                Mehr erfahren
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof - Removed */}
        </motion.div>
      </div>
    </section>
  );
}