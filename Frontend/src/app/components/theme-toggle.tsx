import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/contexts/theme-context";
import { cn } from "@/app/components/ui/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
}

export function ThemeToggle({ className, variant = "ghost", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        variant === "ghost" && "p-2 text-muted-foreground hover:text-foreground hover:bg-accent/80",
        variant === "outline" && "p-2 border border-border bg-background text-foreground hover:bg-accent shadow-xs",
        showLabel ? "px-3 py-2 gap-2 text-sm font-medium" : "size-9",
        className
      )}
    >
      <div className="relative size-5 flex items-center justify-center shrink-0">
        <Sun
          className={cn(
            "size-5 text-amber-500 transition-all duration-300 transform",
            isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute size-5 text-sky-400 transition-all duration-300 transform",
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium select-none">
          {isDark ? "Modo Claro" : "Modo Escuro"}
        </span>
      )}
    </button>
  );
}
