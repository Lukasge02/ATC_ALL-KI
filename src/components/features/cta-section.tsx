"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Star, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";

export function CTASection() {
  const benefits = [
    "AI-Profile erstellen und verwalten",
    "Widget-System nutzen", 
    "Chat mit verschiedenen AI-Profilen",
    "Kalender-Integration (iCal)",
    "Lokale Datenspeicherung"
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      
      <div className="container px-4 mx-auto relative">
        <motion.div
          className="max-w-4xl mx-auto text-center space-y-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {/* Main CTA */}
          <div className="space-y-8">
            <motion.div variants={ANIMATION_PRESETS.slideUp}>
              <Badge variant="gradient" className="mb-4">
                <Star className="w-4 h-4 mr-2" />
                Jetzt starten
              </Badge>
            </motion.div>

            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              variants={ANIMATION_PRESETS.slideUp}
            >
              Bereit für deine
              <span className="gradient-text"> KI-Revolution</span>?
            </motion.h2>

            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={ANIMATION_PRESETS.slideUp}
            >
              Erstelle personalisierte KI-Assistenten und organisiere deinen Alltag 
              mit innovativen Widgets.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={ANIMATION_PRESETS.slideUp}
            >
              <Button size="xl" variant="gradient" className="group" asChild>
                <Link href="/register">
                  <span>
                    Kostenlos ausprobieren
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/demo">
                  Live Demo ansehen
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
              variants={ANIMATION_PRESETS.slideUp}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Komplett kostenlos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Keine Anmeldung nötig</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Open Source</span>
              </div>
            </motion.div>
          </div>

          {/* Benefits Grid */}
          <motion.div variants={ANIMATION_PRESETS.slideUp}>
            <Card className="max-w-2xl mx-auto border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Was du bekommst:</h3>
                    <p className="text-muted-foreground">Alles was du brauchst, um durchzustarten</p>
                  </div>
                  
                  <div className="grid gap-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}