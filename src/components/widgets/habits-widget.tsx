import { useState } from "react";
import { BaseWidget } from "./base-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Check, Plus, Flame, Calendar } from "lucide-react";
import { Widget } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitsWidgetProps {
  widget: Widget;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function HabitsWidget({ 
  widget, 
  onEdit, 
  onRemove,
  className 
}: HabitsWidgetProps) {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: "Morgendliche Meditation",
      streak: 7,
      completedToday: true,
      color: "bg-purple-500",
      icon: "🧘"
    },
    {
      id: 2,
      name: "10k Schritte gehen",
      streak: 5,
      completedToday: false,
      color: "bg-green-500",
      icon: "🚶"
    },
    {
      id: 3,
      name: "Buch lesen (30min)",
      streak: 12,
      completedToday: true,
      color: "bg-blue-500",
      icon: "📚"
    },
    {
      id: 4,
      name: "Code schreiben",
      streak: 15,
      completedToday: true,
      color: "bg-orange-500",
      icon: "💻"
    }
  ]);

  const totalStreak = Math.max(...habits.map(h => h.streak));
  const completedToday = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedToday / habits.length) * 100);

  const toggleHabit = (habitId: number) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, completedToday: !habit.completedToday }
        : habit
    ));
  };

  const getStreakBadgeColor = (streak: number) => {
    if (streak >= 14) return "gradient";
    if (streak >= 7) return "secondary";
    return "outline";
  };

  return (
    <BaseWidget
      widget={widget}
      onEdit={onEdit}
      onRemove={onRemove}
      className={className}
    >
      <div className="h-full space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold gradient-text">{totalStreak}</div>
            <div className="text-xs text-muted-foreground">Längste Serie</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">Heute erledigt</div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                strokeWidth="2"
                strokeDasharray={`${completionRate}, 100`}
                strokeLinecap="round"
                className="text-primary stroke-current transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{completedToday}/{habits.length}</span>
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => toggleHabit(habit.id)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  habit.completedToday
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 hover:border-primary"
                )}
              >
                {habit.completedToday && <Check className="w-3 h-3" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{habit.icon}</span>
                  <span className={cn(
                    "text-sm font-medium truncate",
                    habit.completedToday && "line-through text-muted-foreground"
                  )}>
                    {habit.name}
                  </span>
                </div>
              </div>
              
              <Badge 
                variant={getStreakBadgeColor(habit.streak)} 
                className="text-xs"
              >
                {habit.streak}🔥
              </Badge>
            </div>
          ))}
        </div>

        {/* Weekly View */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Diese Woche
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day}</div>
                <div className={cn(
                  "w-6 h-6 rounded flex items-center justify-center text-xs",
                  index < 5 ? "bg-primary/20" : index === 5 ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {index < 5 ? "✓" : index === 5 ? "3/4" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex-1 text-xs h-7">
            <Plus className="h-3 w-3 mr-1" />
            Habit
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs h-7">
            <Calendar className="h-3 w-3 mr-1" />
            Historie
          </Button>
        </div>
      </div>
    </BaseWidget>
  );
}