"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Plus,
  Command,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  className?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "Neues AI-Profil erstellt",
      message: "Developer Assistant ist jetzt verfügbar",
      time: "2 Min ago",
      read: false
    },
    {
      id: 2,
      title: "Widget-Update",
      message: "Analytics Widget wurde aktualisiert",
      time: "1 Std ago",
      read: false
    },
    {
      id: 3,
      title: "Streak erreicht!",
      message: "7 Tage in Folge mit ALL-KI produktiv",
      time: "3 Std ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Chats, Profilen, Widgets..."
              className="pl-9 pr-4"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg p-2 z-50">
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                  <Command className="h-3 w-3" />
                  <span>Drücke Cmd+K für erweiterte Suche</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Neuer Chat
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Action
          </Button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Benachrichtigungen
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} neu
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 space-y-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                Alle Benachrichtigungen anzeigen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}