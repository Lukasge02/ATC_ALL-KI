"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  LayoutGrid, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar,
  Target,
  BarChart3,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useChatStore } from "@/lib/store/useChatStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profiles, isAuthenticated } = useAuthStore();
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Load conversations for recent activity
    fetchConversations();
  }, [isAuthenticated, router, fetchConversations]);

  // Calculate real stats from user data
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
  const totalTokens = profiles.reduce((sum, profile) => sum + (profile.usage?.totalTokens || 0), 0);
  const totalChats = profiles.reduce((sum, profile) => sum + (profile.usage?.totalChats || 0), 0);

  const stats = [
    {
      label: "Aktive AI-Profile",
      value: profiles.length.toString(),
      change: profiles.length > 0 ? "Profile verfügbar" : "Erstelle dein erstes Profil",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      label: "Unterhaltungen",
      value: conversations.length.toString(),
      change: `${totalMessages} Nachrichten insgesamt`,
      trend: "up",
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      label: "Token verbraucht",
      value: totalTokens.toString(),
      change: `Aus ${totalChats} Chats`,
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      label: "Widgets verfügbar",
      value: "12",
      change: "Alle Features aktiv",
      trend: "up",
      icon: LayoutGrid,
      color: "text-orange-500"
    }
  ];

  // Generate recent activity from real data
  const recentActivity = [
    ...conversations.slice(0, 2).map((conv, index) => ({
      id: `conv-${index}`,
      type: "chat",
      title: "Unterhaltung geführt",
      description: `Mit ${conv.profile.name}: ${conv.title}`,
      time: new Date(conv.updatedAt).toLocaleDateString('de-DE'),
      icon: MessageSquare
    })),
    ...profiles.slice(0, 1).map((profile, index) => ({
      id: `profile-${index}`,
      type: "profile",
      title: "AI-Profil erstellt",
      description: `${profile.name} - ${profile.description}`,
      time: new Date(profile.createdAt).toLocaleDateString('de-DE'),
      icon: Users
    }))
  ].slice(0, 3);

  // If no real activity, show default
  const defaultActivity = [
    {
      id: 1,
      type: "welcome",
      title: "Willkommen bei ALL-KI!",
      description: "Erstelle dein erstes AI-Profil",
      time: "Jetzt",
      icon: Sparkles
    }
  ];

  const activityToShow = recentActivity.length > 0 ? recentActivity : defaultActivity;

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {/* Welcome Section */}
      <motion.div variants={ANIMATION_PRESETS.slideUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Willkommen zurück, {user?.name?.split(' ')[0] || 'Nutzer'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Hier ist dein persönliches KI-Dashboard. Verwalte deine Assistenten und steigere deine Produktivität.
            </p>
          </div>
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Widget hinzufügen
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={ANIMATION_PRESETS.slideUp}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={ANIMATION_PRESETS.slideUp}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary group-hover:from-primary group-hover:to-primary/80 transition-all duration-300" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget Grid */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          variants={ANIMATION_PRESETS.slideUp}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Deine Widgets</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Layout anpassen
            </Button>
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Chat Widget */}
            <Card className="md:col-span-2 group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Quick Chat
                  </CardTitle>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-xs text-white font-medium">DA</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Developer Assistant</p>
                      <p className="text-xs text-muted-foreground">Zuletzt aktiv</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">"Hilfe bei React Components?"</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Chat fortsetzen
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Widget */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">247</div>
                    <p className="text-xs text-muted-foreground">Nachrichten diese Woche</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Developer</span>
                      <span>68%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Details anzeigen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Widget */}
            <Card className="md:col-span-2 group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Kommende Termine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-bold">15</div>
                        <div className="text-xs text-muted-foreground">DEZ</div>
                      </div>
                      <div>
                        <p className="font-medium">Team Meeting</p>
                        <p className="text-sm text-muted-foreground">14:30 - 15:30</p>
                      </div>
                    </div>
                    <Badge variant="outline">In 2h</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Alle Termine anzeigen (3)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Habits Widget */}
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Gewohnheiten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text">7</div>
                    <p className="text-sm text-muted-foreground">Tage Streak</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Heute erledigt</span>
                      <span>3/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Habits verwalten
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          className="space-y-6"
          variants={ANIMATION_PRESETS.slideUp}
        >
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Letzte Aktivitäten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityToShow.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Schnellaktionen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push('/chat')}
                >
                  <MessageSquare className="h-4 w-4" />
                  Neuer Chat starten
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push('/profiles')}
                >
                  <Users className="h-4 w-4" />
                  AI-Profil erstellen
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Widget hinzufügen
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics anzeigen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="gradient-primary text-white">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Produktivitäts-Tipp</span>
                </div>
                <p className="text-sm text-white/90">
                  Nutze Keyboard Shortcuts (Cmd+K) für schnellere Navigation zwischen deinen AI-Profilen!
                </p>
                <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  Mehr Tipps
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}