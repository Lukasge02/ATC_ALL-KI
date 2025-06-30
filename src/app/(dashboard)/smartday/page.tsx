"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Plus,
  Zap,
  Brain,
  Coffee
} from "lucide-react";
import { motion } from "framer-motion";

export default function SmartDayPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Frontend Review", priority: "high", estimated: "2h", status: "pending" },
    { id: 2, title: "Backend API Tests", priority: "medium", estimated: "1.5h", status: "pending" },
    { id: 3, title: "Documentation Update", priority: "low", estimated: "30min", status: "pending" }
  ]);

  const schedule = [
    { time: "09:00", activity: "Deep Work Session", type: "focus", duration: "2h" },
    { time: "11:00", activity: "Team Meeting", type: "meeting", duration: "1h" },
    { time: "14:00", activity: "Creative Time", type: "creative", duration: "1.5h" },
    { time: "16:00", activity: "Admin Tasks", type: "admin", duration: "1h" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Smart Day</h1>
            <p className="text-muted-foreground">KI-optimierte Tagesplanung für maximale Produktivität</p>
          </div>
          <Badge variant="gradient" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            KI-Powered
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Heutiger Zeitplan
              </CardTitle>
              <CardDescription>
                KI-optimiert basierend auf deinen Arbeitsmustern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {item.type === 'focus' && <Zap className="w-5 h-5 text-primary" />}
                      {item.type === 'meeting' && <Coffee className="w-5 h-5 text-primary" />}
                      {item.type === 'creative' && <Brain className="w-5 h-5 text-primary" />}
                      {item.type === 'admin' && <CheckCircle className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.activity}</h4>
                      <p className="text-sm text-muted-foreground">{item.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg">{item.time}</p>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks & Insights */}
        <div className="space-y-6">
          {/* Priority Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Prioritäten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.estimated}</p>
                    </div>
                    <Badge 
                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Aufgabe hinzufügen
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="gradient-primary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  KI-Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="text-sm font-medium">🎯 Produktivitäts-Tipp</p>
                  <p className="text-xs text-white/80 mt-1">
                    Deine beste Arbeitszeit ist 9-11 Uhr. Plane schwierige Tasks in diesem Zeitfenster.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="text-sm font-medium">⚡ Energie-Level</p>
                  <p className="text-xs text-white/80 mt-1">
                    Nach dem Mittagessen kurze Pause einplanen für optimale Leistung.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 justify-center"
      >
        <Button size="lg" variant="gradient">
          <Clock className="w-5 h-5 mr-2" />
          Tag starten
        </Button>
        <Button size="lg" variant="outline">
          Zeitplan anpassen
        </Button>
      </motion.div>
    </div>
  );
}