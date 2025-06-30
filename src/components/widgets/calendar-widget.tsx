import { BaseWidget } from "./base-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, MapPin } from "lucide-react";
import { Widget } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CalendarWidgetProps {
  widget: Widget;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function CalendarWidget({ 
  widget, 
  onEdit, 
  onRemove,
  className 
}: CalendarWidgetProps) {
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      time: "14:30 - 15:30",
      date: "Heute",
      location: "Conference Room A",
      type: "meeting",
      color: "bg-blue-500",
      timeUntil: "In 2h"
    },
    {
      id: 2,
      title: "Code Review",
      time: "16:00 - 17:00", 
      date: "Heute",
      location: "Online",
      type: "work",
      color: "bg-green-500",
      timeUntil: "In 4h"
    },
    {
      id: 3,
      title: "Client Call",
      time: "10:00 - 11:00",
      date: "Morgen",
      location: "Zoom",
      type: "call",
      color: "bg-purple-500",
      timeUntil: "Morgen"
    }
  ];

  const todayEvents = events.filter(event => event.date === "Heute");
  const upcomingEvents = events.filter(event => event.date !== "Heute");

  const getTimeStatus = (timeUntil: string) => {
    if (timeUntil.includes("h")) {
      return "warning";
    }
    if (timeUntil === "Morgen") {
      return "secondary";
    }
    return "default";
  };

  return (
    <BaseWidget
      widget={widget}
      onEdit={onEdit}
      onRemove={onRemove}
      className={className}
    >
      <div className="h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString("de-DE", { 
                weekday: "long",
                day: "numeric",
                month: "short"
              })}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {events.length} Termine
          </Badge>
        </div>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Heute
            </h4>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={cn("w-2 h-2 rounded-full mt-2", event.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <Badge 
                        variant={getTimeStatus(event.timeUntil) as any} 
                        className="text-xs"
                      >
                        {event.timeUntil}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Anstehend
            </h4>
            <div className="space-y-1">
              {upcomingEvents.slice(0, 2).map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full", event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}, {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Events */}
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Keine Termine heute</p>
            <p className="text-xs text-muted-foreground">Entspann dich! 🎉</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex-1 text-xs h-7">
            <Plus className="h-3 w-3 mr-1" />
            Termin
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs h-7">
            Alle anzeigen
          </Button>
        </div>

        {/* Week Overview */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Diese Woche
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day}</div>
                <div className={cn(
                  "w-6 h-6 rounded text-xs flex items-center justify-center",
                  index === 2 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}>
                  {10 + index}
                </div>
                {/* Event indicators */}
                <div className="flex justify-center mt-1">
                  {index === 2 && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                  {index === 3 && <div className="w-1 h-1 bg-green-500 rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}