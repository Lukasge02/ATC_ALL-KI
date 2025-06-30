import Link from "next/link";
import { Brain, Github, Twitter, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Preise", href: "/pricing" },
      { name: "Changelog", href: "/changelog" },
      { name: "Roadmap", href: "/roadmap" },
    ],
    company: [
      { name: "Über uns", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Karriere", href: "/careers" },
      { name: "Kontakt", href: "/contact" },
    ],
    resources: [
      { name: "Dokumentation", href: "/docs" },
      { name: "API", href: "/api" },
      { name: "Community", href: "/community" },
      { name: "Support", href: "/support" },
    ],
    legal: [
      { name: "Datenschutz", href: "/privacy" },
      { name: "AGB", href: "/terms" },
      { name: "Impressum", href: "/imprint" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { name: "GitHub", href: "https://github.com", icon: Github },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
    { name: "Email", href: `mailto:${APP_CONFIG.email}`, icon: Mail },
  ];

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container px-4 mx-auto">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text">ALL-KI</span>
                </div>
              </Link>
              
              <p className="text-muted-foreground max-w-sm">
                {APP_CONFIG.description}. Die intelligente Lösung für deinen digitalen Alltag.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Button key={social.name} variant="ghost" size="icon" asChild>
                    <Link href={social.href} target="_blank" rel="noopener noreferrer">
                      <social.icon className="w-4 h-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Produkt</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Unternehmen</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Ressourcen</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Rechtliches</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">Bleib auf dem Laufenden</h3>
              <p className="text-muted-foreground">
                Erhalte Updates zu neuen Features und AI-Trends direkt in dein Postfach.
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button variant="gradient">
                Abonnieren
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2024 {APP_CONFIG.name}. Alle Rechte vorbehalten.</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in Deutschland</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}