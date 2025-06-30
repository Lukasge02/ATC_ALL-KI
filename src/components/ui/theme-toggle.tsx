"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./button";
import { useThemeStore } from "@/lib/store/useThemeStore";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "button" | "tabs";
}

export function ThemeToggle({ className, variant = "button" }: ThemeToggleProps) {
  const { mode, setMode, actualTheme } = useThemeStore();

  React.useEffect(() => {
    useThemeStore.getState().initializeTheme();
  }, []);

  if (variant === "tabs") {
    return (
      <div className={cn("flex rounded-lg border p-1", className)}>
        <Button
          variant={mode === "light" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("light")}
          className="h-8 w-8 p-0"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={mode === "system" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("system")}
          className="h-8 w-8 p-0"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={mode === "dark" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setMode("dark")}
          className="h-8 w-8 p-0"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMode(actualTheme === "light" ? "dark" : "light")}
      className={className}
    >
      <div className="relative">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
    </Button>
  );
}