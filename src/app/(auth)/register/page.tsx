"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Eye, EyeOff, Github, Mail, ArrowLeft, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: true
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setLocalError("Bitte alle Felder ausfüllen");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwörter stimmen nicht überein");
      return;
    }
    
    if (!formData.acceptTerms) {
      setLocalError("Bitte akzeptiere die Nutzungsbedingungen");
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
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

    // Password strength validation
    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Registration Form */}
      <div className="lg:flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div 
          className="w-full max-w-md space-y-6"
          initial="initial"
          animate="animate"
          variants={ANIMATION_PRESETS.slideLeft}
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
              <CardTitle className="text-2xl font-bold">Konto erstellen</CardTitle>
              <CardDescription>
                Starte deine KI-Reise mit ALL-KI
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Social Registration Buttons */}
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  type="text"
                  label="Vollständiger Name"
                  placeholder="Max Mustermann"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  name="email"
                  type="email"
                  label="E-Mail"
                  placeholder="mail@beispiel.de"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      label="Passwort"
                      placeholder="Erstelle ein sicheres Passwort"
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground">Passwort-Stärke:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={cn("flex items-center gap-1", passwordStrength.length ? "text-green-600" : "text-muted-foreground")}>
                          {passwordStrength.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Mindestens 8 Zeichen
                        </div>
                        <div className={cn("flex items-center gap-1", passwordStrength.uppercase ? "text-green-600" : "text-muted-foreground")}>
                          {passwordStrength.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Großbuchstabe
                        </div>
                        <div className={cn("flex items-center gap-1", passwordStrength.lowercase ? "text-green-600" : "text-muted-foreground")}>
                          {passwordStrength.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Kleinbuchstabe
                        </div>
                        <div className={cn("flex items-center gap-1", passwordStrength.number ? "text-green-600" : "text-muted-foreground")}>
                          {passwordStrength.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Zahl
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    label="Passwort bestätigen"
                    placeholder="Wiederhole dein Passwort"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={formData.confirmPassword && !passwordsMatch ? "Passwörter stimmen nicht überein" : undefined}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-8 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start space-x-2 text-sm">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      required
                      className="mt-0.5 rounded border-input"
                    />
                    <span>
                      Ich akzeptiere die{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Nutzungsbedingungen
                      </Link>{" "}
                      und{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Datenschutzerklärung
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="rounded border-input"
                    />
                    <span>Newsletter mit Updates und KI-Tipps erhalten</span>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="gradient"
                  loading={isLoading}
                  disabled={!isPasswordValid || !passwordsMatch || !formData.acceptTerms}
                >
                  {isLoading ? "Konto wird erstellt..." : "Konto erstellen"}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Bereits ein Konto?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Jetzt anmelden
                </Link>
              </div>
              
              <Badge variant="secondary" className="mx-auto">
                🔒 Deine Daten sind sicher
              </Badge>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="lg:flex-1 gradient-primary flex items-center justify-center p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-white/10 blur-xl" />
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
          <motion.div variants={ANIMATION_PRESETS.slideRight}>
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">ALL-KI</span>
            </Link>
          </motion.div>
          
          <motion.div variants={ANIMATION_PRESETS.slideRight}>
            <h1 className="text-3xl lg:text-4xl font-bold">
              Deine KI-Reise beginnt hier
            </h1>
          </motion.div>
          
          <motion.div variants={ANIMATION_PRESETS.slideRight}>
            <p className="text-lg text-white/90">
              Erstelle dein kostenloses Konto und entdecke die Zukunft 
              der personalisierten KI-Assistenten.
            </p>
          </motion.div>
          
          <motion.div variants={ANIMATION_PRESETS.slideRight}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">14 Tage kostenlos testen</p>
                  <p className="text-sm text-white/70">Keine Kreditkarte erforderlich</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Unbegrenzte AI-Profile</p>
                  <p className="text-sm text-white/70">Für jeden Lebensbereich</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Premium Widget-System</p>
                  <p className="text-sm text-white/70">Drag & Drop Interface</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}