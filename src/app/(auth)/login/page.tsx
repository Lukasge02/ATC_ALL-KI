"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Eye, EyeOff, Github, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [localError, setLocalError] = useState("");

  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    
    if (!formData.email || !formData.password) {
      setLocalError("Bitte alle Felder ausfüllen");
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (error) {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="lg:flex-1 gradient-primary flex items-center justify-center p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-white/10 blur-xl" />
        </div>
        
        <motion.div 
          className="max-w-md space-y-6 relative z-10 text-center lg:text-left"
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.div variants={ANIMATION_PRESETS.slideLeft}>
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">ALL-KI</span>
            </Link>
          </motion.div>
          
          <motion.div variants={ANIMATION_PRESETS.slideLeft}>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Willkommen zurück!
            </h1>
          </motion.div>
          
          <motion.div variants={ANIMATION_PRESETS.slideLeft}>
            <p className="text-lg text-white/90">
              Melde dich an, um deine personalisierten KI-Assistenten zu nutzen 
              und deine Produktivität zu maximieren.
            </p>
          </motion.div>
          
          <motion.div variants={ANIMATION_PRESETS.slideLeft}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-white/80">Unbegrenzte AI-Profile</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-white/80">Intelligentes Widget-System</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-white/80">Advanced Analytics</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div 
          className="w-full max-w-md space-y-6"
          initial="initial"
          animate="animate"
          variants={ANIMATION_PRESETS.slideRight}
        >
          {/* Back to Home Link */}
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
              <CardDescription>
                Gib deine E-Mail und Passwort ein, um dich anzumelden
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" type="button">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  <Mail className="w-4 h-4 mr-2" />
                  Google
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Oder mit E-Mail
                  </span>
                </div>
              </div>

              {/* Error Messages */}
              {(error || localError) && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error || localError}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="email"
                  type="email"
                  label="E-Mail"
                  placeholder="mail@beispiel.de"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Passwort"
                    placeholder="Dein Passwort"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-8 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="rounded border-input"
                    />
                    <span>Angemeldet bleiben</span>
                  </label>
                  
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Passwort vergessen?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="gradient"
                  loading={isLoading}
                >
                  {isLoading ? "Wird angemeldet..." : "Anmelden"}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Noch kein Konto?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Jetzt registrieren
                </Link>
              </div>
              
              <Badge variant="secondary" className="mx-auto">
                🔒 Sicher verschlüsselt
              </Badge>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}