import { Widget } from "@/lib/types";
import { 
  QuickChatWidget, 
  AnalyticsWidget, 
  CalendarWidget, 
  HabitsWidget 
} from "./index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface WidgetFactoryProps {
  widget: Widget;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function WidgetFactory({ 
  widget, 
  onEdit, 
  onRemove, 
  className 
}: WidgetFactoryProps) {
  // Widget Factory - renders the appropriate widget based on type
  const renderWidget = () => {
    switch (widget.type) {
      case "quick-chat":
        return (
          <QuickChatWidget
            widget={widget}
            onEdit={onEdit}
            onRemove={onRemove}
            className={className}
          />
        );
      
      case "analytics":
        return (
          <AnalyticsWidget
            widget={widget}
            onEdit={onEdit}
            onRemove={onRemove}
            className={className}
          />
        );
      
      case "calendar":
        return (
          <CalendarWidget
            widget={widget}
            onEdit={onEdit}
            onRemove={onRemove}
            className={className}
          />
        );
      
      case "habits":
        return (
          <HabitsWidget
            widget={widget}
            onEdit={onEdit}
            onRemove={onRemove}
            className={className}
          />
        );
      
      case "notes":
        return <PlaceholderWidget widget={widget} type="Notes" />;
      
      case "focus-timer":
        return <PlaceholderWidget widget={widget} type="Focus Timer" />;
      
      default:
        return <PlaceholderWidget widget={widget} type="Unknown" />;
    }
  };

  return renderWidget();
}

// Placeholder widget for unimplemented types
function PlaceholderWidget({ widget, type }: { widget: Widget; type: string }) {
  return (
    <Card className="relative group">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-24 text-center space-y-2">
          <div className="text-2xl">🚧</div>
          <p className="text-sm text-muted-foreground">
            {type} Widget wird noch entwickelt
          </p>
          <p className="text-xs text-muted-foreground">
            Bald verfügbar!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}