import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Theme Toggle in top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {children}
    </div>
  );
}