import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetContainerProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onRemove?: () => void;
  onSettings?: () => void;
  onRefresh?: () => void;
  className?: string;
  size?: string;
  isLoading?: boolean;
}

export function WidgetContainer({
  title,
  icon,
  children,
  onRemove,
  onSettings,
  onRefresh,
  className,
  size,
  isLoading = false
}: WidgetContainerProps) {
  return (
    <Card className={cn("h-full flex flex-col group", className)}>
      <CardHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onRefresh && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              </Button>
            )}
            {onSettings && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onSettings}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={onRemove}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-3 overflow-hidden">
        {children}
      </CardContent>
    </Card>
  );
}