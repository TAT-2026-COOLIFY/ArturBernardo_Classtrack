import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Users, UsersRound, CreditCard, Calendar, LayoutDashboard, Tag, LogOut, CalendarPlus } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useAuth } from "@/app/contexts/auth-context";
import { Button } from "@/app/components/ui/button";
import { ThemeToggle } from "@/app/components/theme-toggle";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Alunos", path: "/alunos", icon: Users },
  { name: "Grupos", path: "/grupos", icon: UsersRound },
  { name: "Planos", path: "/planos", icon: Tag },
  { name: "Pagamentos", path: "/pagamentos", icon: CreditCard },
  { name: "Calendário", path: "/calendario", icon: Calendar },
  { name: "Aulas Avulsas", path: "/aulas-avulsas", icon: CalendarPlus }
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-muted/40 dark:bg-background text-foreground transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-card dark:bg-sidebar border-r border-border transition-colors duration-200 shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground truncate">Classtrack</h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">Gestão de Aulas e Alunos</p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Olá, <span className="font-medium text-foreground">{user.name}</span>
                </p>
              )}
            </div>
            <ThemeToggle className="shrink-0" />
          </div>
          
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3 border-border hover:bg-accent"
            >
              <LogOut className="size-5 shrink-0" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background/50 dark:bg-background">
        <Outlet />
      </main>
    </div>
  );
}