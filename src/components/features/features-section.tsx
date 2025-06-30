"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  Puzzle, 
  Target, 
  MessageSquare, 
  BarChart3,
  Palette,
  Shield,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Profile Management",
      description: "Erstelle personalisierte KI-Assistenten für jeden Lebensbereich - vom Developer bis zum Business Coach.",
      badge: "Verfügbar",
      color: "text-blue-500"
    },
    {
      icon: MessageSquare,
      title: "Multi-Profile Chat",
      description: "Nahtlos zwischen verschiedenen AI-Profilen wechseln und kontextbezogene Gespräche führen.",
      badge: "Verfügbar",
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Sichere Authentifizierung",
      description: "Sicherer Login und Registrierung mit modernen Sicherheitsstandards.",
      badge: "Verfügbar",
      color: "text-gray-500"
    },
    {
      icon: Palette,
      title: "Modernes Dashboard",
      description: "Übersichtliches und responsives Dashboard für alle deine KI-Aktivitäten.",
      badge: "Verfügbar",
      color: "text-pink-500"
    },
    {
      icon: Sparkles,
      title: "Quick Chat",
      description: "Schnelle KI-Gespräche ohne Umwege - direkt vom Dashboard aus verfügbar.",
      badge: "Verfügbar",
      color: "text-purple-500"
    },
    {
      icon: Zap,
      title: "Responsive Design",
      description: "Perfekt optimiert für Desktop, Tablet und Mobile - überall einsatzbereit.",
      badge: "Verfügbar",
      color: "text-yellow-500"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <motion.div
          className="text-center space-y-4 mb-16"
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
          <motion.div variants={ANIMATION_PRESETS.slideUp}>
            <Badge variant="gradient" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Features
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            variants={ANIMATION_PRESETS.slideUp}
          >
            Alles was du für deinen
            <span className="gradient-text"> KI-Alltag </span>
            brauchst
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={ANIMATION_PRESETS.slideUp}
          >
            Von personalisierten AI-Profilen bis hin zu innovativen Widgets - 
            ALL-KI bietet alles für eine produktive KI-Erfahrung.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={ANIMATION_PRESETS.slideUp}>
              <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-background border ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:gradient-text transition-all">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Getting Started Highlight */}
        <motion.div
          className="mt-16 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={ANIMATION_PRESETS.slideUp}
        >
          <Card className="max-w-4xl mx-auto gradient-primary text-white border-0">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  🚀 Erste Schritte
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold">
                  Starte jetzt mit ALL-KI
                </h3>
                <p className="text-lg text-white/90 max-w-2xl mx-auto">
                  Registriere dich kostenlos, erstelle dein erstes AI-Profil und 
                  beginne sofort mit personalisierten KI-Gesprächen.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-sm">Kostenlose Registrierung</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-sm">Sofort einsatzbereit</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-sm">Personalisierte KI</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}