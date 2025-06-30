"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sun,
  Coffee,
  CheckCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  MapPin,
  Car,
  CloudRain,
  Thermometer,
  Wind,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function SmartMorningPage() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const morningRoutine = [
    { id: 1, task: "Tagesplanung erstellen", time: "5 min", importance: "high" },
    { id: 2, task: "Wichtigste E-Mails checken", time: "10 min", importance: "medium" },
    { id: 3, task: "Prioritäten festlegen", time: "5 min", importance: "high" },
    { id: 4, task: "Kurze Meditation", time: "10 min", importance: "low" }
  ];

  const insights = [
    { title: "Energie-Level", value: "87%", trend: "up", color: "text-green-500" },
    { title: "Fokus-Zeit", value: "4.2h", trend: "up", color: "text-blue-500" },
    { title: "Erledigte Tasks", value: "12/15", trend: "stable", color: "text-orange-500" }
  ];

  const routeInfo = {
    destination: "Büro",
    normalTime: "25 min",
    currentTime: "32 min",
    distance: "12.5 km",
    weather: {
      temp: "4°C",
      condition: "Tau/Nebel",
      visibility: "200m",
      warning: true
    },
    recommendations: [
      "Zusätzliche 7 Minuten einplanen",
      "Vorsichtig fahren - schlechte Sicht",
      "Scheinwerfer einschalten",
      "Warme Kleidung mitnehmen"
    ]
  };

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sun className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold gradient-text">Smart Morning</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Starte deinen Tag optimal mit KI-gestützter Morgenroutine und personalisierten Insights
        </p>
        <Badge variant="gradient" className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Guten Morgen! Heute ist ein perfekter Tag für Produktivität
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Morning Routine */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                Morgen-Routine
              </CardTitle>
              <CardDescription>
                Deine personalisierte Checkliste für einen produktiven Start
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {morningRoutine.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                    checkedItems.includes(item.id) 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-card/50 hover:bg-card/80'
                  }`}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      checkedItems.includes(item.id)
                        ? 'bg-primary border-primary text-white'
                        : 'border-muted-foreground'
                    }`}>
                      {checkedItems.includes(item.id) && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${checkedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                        {item.task}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={item.importance === 'high' ? 'destructive' : item.importance === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {item.importance}
                  </Badge>
                </motion.div>
              ))}
              
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Fortschritt</span>
                  <span className="text-sm text-muted-foreground">
                    {checkedItems.length}/{morningRoutine.length} erledigt
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(checkedItems.length / morningRoutine.length) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Route Planning */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className={`${routeInfo.weather.warning ? 'border-orange-200 bg-orange-50/30' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Route zur Arbeit
              </CardTitle>
              <CardDescription>
                Aktuelle Verkehrs- und Wetterlage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Destination & Time */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{routeInfo.destination}</span>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${routeInfo.currentTime !== routeInfo.normalTime ? 'text-orange-600' : 'text-green-600'}`}>
                    {routeInfo.currentTime}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Normal: {routeInfo.normalTime}
                  </p>
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Wetter-Bedingungen</span>
                  {routeInfo.weather.warning && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-blue-400" />
                    <span>{routeInfo.weather.temp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-gray-400" />
                    <span>{routeInfo.weather.condition}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-400" />
                    <span>Sicht: {routeInfo.weather.visibility}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-400" />
                    <span>{routeInfo.distance}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Empfehlungen
                </h4>
                <div className="space-y-1">
                  {routeInfo.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Action */}
              <Button variant="outline" className="w-full mt-3">
                <MapPin className="w-4 h-4 mr-2" />
                Navigation starten
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights & Quick Actions */}
        <div className="space-y-6">
          {/* Performance Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{insight.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${insight.color}`}>{insight.value}</span>
                      <TrendingUp className={`w-4 h-4 ${insight.color}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="gradient-primary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Heutiger Fokus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="font-medium">🎯 Hauptziel</p>
                  <p className="text-sm text-white/80 mt-1">
                    Frontend-Komponenten fertigstellen
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="font-medium">⏰ Deep Work</p>
                  <p className="text-sm text-white/80 mt-1">
                    9:00 - 11:00 Uhr (2 Stunden)
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="font-medium">💡 KI-Tipp</p>
                  <p className="text-sm text-white/80 mt-1">
                    Schwierigste Aufgabe zuerst - höchste Konzentration!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Kalender öffnen
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  KI-Chat starten
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Pomodoro Timer
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button size="lg" variant="gradient" className="px-8">
          <Sun className="w-5 h-5 mr-2" />
          Tag erfolgreich starten!
        </Button>
      </motion.div>
    </div>
  );
}