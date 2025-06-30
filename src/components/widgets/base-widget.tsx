import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Maximize2, Settings, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Widget } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BaseWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  className?: string;
  onEdit?: () => void;
  onRemove?: () => void;
  onExpand?: () => void;
  isDragging?: boolean;
}

export function BaseWidget({
  widget,
  children,
  className,
  onEdit,
  onRemove,
  onExpand,
  isDragging = false
}: BaseWidgetProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case "1x1":
        return "col-span-1 row-span-1";
      case "2x1":
        return "col-span-2 row-span-1";
      case "2x2":
        return "col-span-2 row-span-2";
      case "3x1":
        return "col-span-3 row-span-1";
      case "3x2":
        return "col-span-3 row-span-2";
      default:
        return "col-span-1 row-span-1";
    }
  };

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-200 hover:shadow-lg",
        getSizeClasses(widget.size),
        isDragging && "scale-105 shadow-xl z-50 rotate-1",
        !widget.isVisible && "opacity-50",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            {widget.title}
          </CardTitle>
          {!widget.isVisible && (
            <Badge variant="secondary" className="text-xs">
              Verborgen
            </Badge>
          )}
        </div>

        {/* Widget Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onExpand}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Settings className="mr-2 h-4 w-4" />
                  Konfigurieren
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Maximize2 className="mr-2 h-4 w-4" />
                Größe ändern
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onRemove && (
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Entfernen
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="h-full">
        {children}
      </CardContent>

      {/* Drag Handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
      </div>
    </Card>
  );
}