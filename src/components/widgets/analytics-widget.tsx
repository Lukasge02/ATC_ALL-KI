import { BaseWidget } from "./base-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, MessageSquare, Users, ArrowUp, ArrowDown } from "lucide-react";
import { Widget } from "@/lib/types";

interface AnalyticsWidgetProps {
  widget: Widget;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function AnalyticsWidget({ 
  widget, 
  onEdit, 
  onRemove,
  className 
}: AnalyticsWidgetProps) {
  const data = widget.data || {
    totalMessages: 247,
    activeProfiles: 3,
    weeklyGrowth: 23,
    topProfile: "Developer Assistant"
  };

  const stats = [
    {
      label: "Nachrichten",
      value: data.totalMessages,
      change: "+12%",
      trend: "up" as const,
      icon: MessageSquare,
      color: "text-blue-500"
    },
    {
      label: "Profile",
      value: data.activeProfiles,
      change: "+1",
      trend: "up" as const,
      icon: Users,
      color: "text-green-500"
    },
    {
      label: "Wachstum",
      value: `${data.weeklyGrowth}%`,
      change: "diese Woche",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-purple-500"
    }
  ];

  const profileUsage = [
    { name: "Developer", usage: 68, color: "bg-blue-500" },
    { name: "Business", usage: 23, color: "bg-green-500" },
    { name: "Creative", usage: 9, color: "bg-purple-500" }
  ];

  return (
    <BaseWidget
      widget={widget}
      onEdit={onEdit}
      onRemove={onRemove}
      className={className}
    >
      <div className="h-full space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="flex items-center justify-center gap-1">
                {stat.trend === "up" ? (
                  <ArrowUp className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Profil-Nutzung</h4>
            <Badge variant="secondary" className="text-xs">
              7 Tage
            </Badge>
          </div>

          <div className="space-y-2">
            {profileUsage.map((profile) => (
              <div key={profile.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{profile.name}</span>
                  <span className="font-medium">{profile.usage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className={`${profile.color} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${profile.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Chart Visualization */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Aktivität (7 Tage)</h4>
          <div className="flex items-end gap-1 h-16">
            {[40, 65, 45, 80, 60, 95, 75].map((height, index) => (
              <div 
                key={index}
                className="flex-1 bg-primary/20 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mo</span>
            <span>Di</span>
            <span>Mi</span>
            <span>Do</span>
            <span>Fr</span>
            <span>Sa</span>
            <span>So</span>
          </div>
        </div>

        {/* Action Button */}
        <Button variant="ghost" size="sm" className="w-full">
          <BarChart3 className="h-4 w-4 mr-2" />
          Detaillierte Analyse
        </Button>
      </div>
    </BaseWidget>
  );
}