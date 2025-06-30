"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  Home, 
  MessageSquare, 
  Users, 
  Settings, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Calendar,
  Target,
  Sparkles,
  LayoutGrid,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard"
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageSquare,
      current: pathname.startsWith("/chat")
    },
    {
      name: "Quick Chat",
      href: "/quickchat",
      icon: Sparkles,
      current: pathname.startsWith("/quickchat")
    },
    {
      name: "Profile",
      href: "/profiles",
      icon: Users,
      current: pathname.startsWith("/profiles")
    },
    {
      name: "Widgets",
      href: "/widgets",
      icon: LayoutGrid,
      current: pathname.startsWith("/widgets")
    },
    {
      name: "Kalender",
      href: "/calendar",
      icon: Calendar,
      current: pathname.startsWith("/calendar")
    },
    {
      name: "Smart Morning",
      href: "/smartmorning",
      icon: Sparkles,
      current: pathname.startsWith("/smartmorning")
    },
    {
      name: "Smart Day",
      href: "/smartday",
      icon: Sun,
      current: pathname.startsWith("/smartday")
    }
  ];

  const bottomNavigation = [
    {
      name: "Einstellungen",
      href: "/settings",
      icon: Settings,
      current: pathname.startsWith("/settings")
    }
  ];

  const quickActions = [
    {
      name: "Neuer Chat",
      icon: MessageSquare,
      action: () => {}
    },
    {
      name: "AI-Profil erstellen",
      icon: Users,
      action: () => {}
    },
    {
      name: "Widget hinzufügen",
      icon: Plus,
      action: () => {}
    }
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">ALL-KI</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">
                  {user?.name || 'Benutzer'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-b">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={action.action}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>
        
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start relative",
                  collapsed ? "h-10 w-10 p-0" : "h-9"
                )}
              >
                <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1 text-left"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {(item as any).badge && !collapsed && (
                  <Badge variant="secondary" className="ml-auto h-5 w-5 text-xs">
                    {(item as any).badge}
                  </Badge>
                )}
                
                {(item as any).badge && collapsed && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                )}
              </Button>
            </Link>
          ))}
        </div>
      </nav>


      {/* Bottom Navigation */}
      <div className="p-4 border-t">
        <div className="space-y-1">
          {bottomNavigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed ? "h-10 w-10 p-0" : "h-9"
                )}
              >
                <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}