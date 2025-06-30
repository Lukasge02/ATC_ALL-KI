"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Settings,
  LayoutGrid,
  Cloud,
  Newspaper,
  ListTodo,
  Calendar,
  Timer,
  Brain,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth-store";
import { WeatherWidget } from "@/components/widgets/weather/WeatherWidget";
import { NewsWidget } from "@/components/widgets/news/NewsWidget";

interface Widget {
  id: string;
  type: 'weather' | 'news' | 'todo' | 'calendar' | 'timer';
  title: string;
  size: '1x1' | '2x1' | '2x2' | '3x1' | '3x2';
  position: { x: number; y: number };
  config?: any;
}

const WIDGET_TYPES = [
  {
    type: 'weather',
    title: 'Wetter',
    description: 'Aktuelles Wetter & Vorhersage mit KI-Empfehlungen',
    icon: Cloud,
    sizes: ['2x1', '2x2'],
    available: true
  },
  {
    type: 'news',
    title: 'News',
    description: 'Personalisierte Nachrichten mit KI-Zusammenfassungen',
    icon: Newspaper,
    sizes: ['2x2', '3x2'],
    available: true
  },
  {
    type: 'todo',
    title: 'Smart Todo',
    description: 'Aufgabenliste mit KI-Priorisierung',
    icon: ListTodo,
    sizes: ['2x2', '3x3'],
    available: false
  },
  {
    type: 'calendar',
    title: 'Kalender',
    description: 'Termine mit KI-Vorbereitung',
    icon: Calendar,
    sizes: ['2x2', '3x2'],
    available: false
  },
  {
    type: 'timer',
    title: 'Pomodoro',
    description: 'Fokus-Timer mit KI-Optimierung',
    icon: Timer,
    sizes: ['1x1', '2x1'],
    available: false
  }
];

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    // Load widgets from localStorage
    const savedWidgets = localStorage.getItem(`widgets-${currentUser?.id}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }
  }, [currentUser]);

  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(`widgets-${currentUser?.id}`, JSON.stringify(newWidgets));
  };

  const addWidget = (type: string, size: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: type as Widget['type'],
      title: WIDGET_TYPES.find(w => w.type === type)?.title || type,
      size: size as Widget['size'],
      position: { x: 0, y: 0 } // Simple positioning for now
    };

    saveWidgets([...widgets, newWidget]);
    setShowAddDialog(false);
  };

  const removeWidget = (id: string) => {
    saveWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidgetConfig = (id: string, config: any) => {
    saveWidgets(widgets.map(w => 
      w.id === id ? { ...w, config } : w
    ));
  };

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      onRemove: () => removeWidget(widget.id),
      onUpdateConfig: (config: any) => updateWidgetConfig(widget.id, config),
      size: widget.size,
      config: widget.config
    };

    switch (widget.type) {
      case 'weather':
        return <WeatherWidget {...commonProps} />;
      case 'news':
        return <NewsWidget {...commonProps} />;
      default:
        return (
          <Card className="h-full p-4 flex items-center justify-center">
            <p className="text-muted-foreground">Widget nicht verfügbar</p>
          </Card>
        );
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Widgets</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            variant="gradient"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Widget hinzufügen
          </Button>
        </div>
        <p className="text-muted-foreground">
          Erstelle dein persönliches Dashboard mit KI-gestützten Widgets
        </p>
      </div>

      {/* Widget Grid */}
      {widgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg"
        >
          <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Widgets vorhanden</h3>
          <p className="text-muted-foreground mb-4">
            Füge dein erstes Widget hinzu, um loszulegen
          </p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Widget hinzufügen
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-6 gap-4 auto-rows-[200px]">
          {widgets.map((widget) => {
            // Calculate grid span based on widget size
            const [cols, rows] = widget.size.split('x').map(Number);
            const gridColumn = `span ${cols}`;
            const gridRow = `span ${rows}`;

            return (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
                style={{
                  gridColumn,
                  gridRow
                }}
              >
                {renderWidget(widget)}
                
                {/* Widget Controls */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-background/80 backdrop-blur"
                    onClick={() => removeWidget(widget.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Widget hinzufügen</DialogTitle>
            <DialogDescription>
              Wähle ein Widget aus, um es deinem Dashboard hinzuzufügen
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {WIDGET_TYPES.map((widgetType) => {
              const Icon = widgetType.icon;
              
              return (
                <Card
                  key={widgetType.type}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    !widgetType.available && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{widgetType.title}</h3>
                        {!widgetType.available && (
                          <Badge variant="secondary" className="text-xs">
                            Bald verfügbar
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {widgetType.description}
                      </p>
                      
                      {widgetType.available && (
                        <div className="flex gap-2">
                          {widgetType.sizes.map((size) => (
                            <Button
                              key={size}
                              size="sm"
                              variant="outline"
                              onClick={() => addWidget(widgetType.type, size)}
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-medium">KI-Integration:</span>
              <span className="text-muted-foreground">
                Alle Widgets nutzen deine KI-Profile für personalisierte Funktionen
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}