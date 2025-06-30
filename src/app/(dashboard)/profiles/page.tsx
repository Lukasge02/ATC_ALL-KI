"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Users,
  Code,
  GraduationCap,
  Briefcase,
  Palette,
  Heart,
  Bot,
  Star,
  TrendingUp,
  Calendar,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS, PROFILE_CATEGORIES } from "@/lib/constants";
import { ProfileCategory } from "@/lib/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import apiClient from "@/lib/api-client";
import { Spinner } from "@/components/ui/spinner";
import { useToastContext } from "@/components/providers/toast-provider";

export default function ProfilesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProfileCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  
  const router = useRouter();
  const { toast } = useToastContext();
  const { 
    profiles, 
    setProfiles, 
    addProfile, 
    removeProfile, 
    isAuthenticated,
    user 
  } = useAuthStore();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Load profiles from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProfiles();
      setProfiles(response.profiles || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Profile', 'Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    router.push('/profiles/new');
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await apiClient.deleteProfile(profileId);
      removeProfile(profileId);
      toast.success('Profil gelöscht', 'Das AI-Profil wurde erfolgreich gelöscht.');
    } catch (error) {
      toast.error('Fehler beim Löschen des Profils', 'Bitte versuchen Sie es erneut.');
    }
  };

  const handleStartChat = (profileId: string) => {
    router.push(`/chat?profile=${profileId}`);
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || profile.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      label: "Aktive Profile",
      value: profiles.length,
      icon: Users,
      color: "text-blue-500"
    },
    {
      label: "Gesamte Nachrichten",
      value: profiles.reduce((sum, p) => sum + (p.usage?.totalChats || 0), 0),
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      label: "Token verbraucht",
      value: profiles.reduce((sum, p) => sum + (p.usage?.totalTokens || 0), 0),
      icon: TrendingUp,
      color: "text-yellow-500"
    },
    {
      label: "Kategorien",
      value: new Set(profiles.map(p => p.category)).size,
      icon: Palette,
      color: "text-purple-500"
    }
  ];

  const getCategoryIcon = (category: ProfileCategory) => {
    const iconMap = {
      developer: Code,
      student: GraduationCap,
      business: Briefcase,
      creative: Palette,
      personal: Heart,
      general: Bot
    };
    return iconMap[category] || Bot;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Profile werden geladen...</p>
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <motion.div variants={ANIMATION_PRESETS.slideUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI-Profile</h1>
            <p className="text-muted-foreground mt-2">
              Verwalte deine personalisierten KI-Assistenten für verschiedene Bereiche deines Lebens.
            </p>
          </div>
          <Button 
            variant="gradient" 
            className="gap-2"
            onClick={handleCreateProfile}
          >
            <Plus className="h-4 w-4" />
            Neues Profil erstellen
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={ANIMATION_PRESETS.slideUp}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={ANIMATION_PRESETS.slideUp}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        variants={ANIMATION_PRESETS.slideUp}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Profile durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={selectedCategory === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Alle
          </Button>
          {Object.entries(PROFILE_CATEGORIES).map(([key, category]) => {
            const Icon = getCategoryIcon(key as ProfileCategory);
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key as ProfileCategory)}
                className="gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* Profiles Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={ANIMATION_PRESETS.slideUp}
      >
        {filteredProfiles.map((profile, index) => {
          const CategoryIcon = getCategoryIcon(profile.category);
          const categoryInfo = PROFILE_CATEGORIES[profile.category] || { label: profile.category };
          const lastUsed = profile.usage?.lastUsed 
            ? new Date(profile.usage.lastUsed).toLocaleDateString('de-DE')
            : 'Noch nicht verwendet';
          
          return (
            <motion.div
              key={profile.id}
              variants={ANIMATION_PRESETS.slideUp}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300 relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="gradient-primary text-white text-xl">
                          {profile.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="gap-1">
                            <CategoryIcon className="h-3 w-3" />
                            {categoryInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartChat(profile.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat starten
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Konfigurieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {profile.description}
                  </CardDescription>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1">
                    {profile.personality?.expertise?.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(profile.personality?.expertise?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(profile.personality?.expertise?.length || 0) - 3}
                      </Badge>
                    )}
                    {(!profile.personality?.expertise || profile.personality.expertise.length === 0) && (
                      <Badge variant="outline" className="text-xs">
                        {profile.personality?.tone || 'general'}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold">{profile.usage?.totalChats || 0}</div>
                      <div className="text-xs text-muted-foreground">Chats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{profile.usage?.totalTokens || 0}</div>
                      <div className="text-xs text-muted-foreground">Token</div>
                    </div>
                  </div>

                  {/* Last Used */}
                  <div className="text-center pt-1">
                    <div className="text-xs text-muted-foreground">
                      Zuletzt verwendet: {lastUsed}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default"
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleStartChat(profile.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat starten
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filteredProfiles.length === 0 && (
        <motion.div 
          className="text-center py-12"
          variants={ANIMATION_PRESETS.slideUp}
        >
          <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Profile gefunden</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory !== "all" 
              ? "Versuche es mit anderen Suchbegriffen oder Filtern."
              : "Erstelle dein erstes AI-Profil, um loszulegen."
            }
          </p>
          <Button 
            variant="gradient"
            onClick={handleCreateProfile}
          >
            <Plus className="h-4 w-4 mr-2" />
            Neues Profil erstellen
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}