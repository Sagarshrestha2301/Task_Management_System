import { Fragment, type ReactNode, useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { useProjects } from "@/hooks/useProjects";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const MAIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
];

const SETTINGS_NAV: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: projectsData, isLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const projects = projectsData?.projects ?? [];

  return (
    <Sheet
      open={isOpen}
      onOpenChange={onClose}
      side="left"
      className={cn("w-64 lg:w-64", collapsed && "w-16")}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          {!collapsed && (
            <span className="font-semibold text-lg text-text">TaskFlow</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn("flex-shrink-0", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-2 py-3 space-y-1"
          aria-label="Main navigation"
          role="navigation"
        >
          <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
            {!collapsed && "Main"}
          </div>
          {MAIN_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "text-text-muted hover:bg-surface-muted hover:text-text",
                collapsed && "justify-center",
              )}
              onClick={onClose}
            >
              <span className="flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto px-1.5 py-0.5 text-xs bg-accent-soft text-accent rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {!collapsed && (
          <div className="border-t border-border pt-3">
            <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
              Projects
            </div>
            <nav className="space-y-1" aria-label="Projects">
              <a
                href="/projects/new"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "text-accent hover:bg-accent-soft",
                )}
                onClick={onClose}
              >
                <span className="flex-shrink-0" aria-hidden="true">
                  <Plus className="h-5 w-5" />
                </span>
                <span>New Project</span>
              </a>
              {isLoading ? (
                <div className="px-3 py-2 h-10 animate-pulse">
                  <div className="h-full w-full bg-surface-muted rounded animate-pulse" />
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-muted text-center">
                  No projects yet
                </div>
              ) : (
                <Dropdown
                  trigger={
                    <button
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "text-text-muted hover:bg-surface-muted hover:text-text",
                        selectedProjectId && "bg-accent-soft text-accent",
                      )}
                      aria-haspopup="true"
                      aria-expanded={false}
                    >
                      <FolderKanban className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate flex-1">
                        {selectedProjectId
                          ? (projects.find((p) => p.id === selectedProjectId)
                              ?.name ?? "Select project")
                          : "Select project"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-text-muted flex-shrink-0" />
                    </button>
                  }
                  content={
                    <>
                      {projects.map((project) => (
                        <DropdownItem
                          key={project.id}
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            onClose();
                          }}
                        >
                          {project.name}
                        </DropdownItem>
                      ))}
                    </>
                  }
                  align="start"
                />
              )}
            </nav>
          </div>
        )}

        <div className="mt-auto border-t border-border pt-3">
          <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider">
            {!collapsed && "Account"}
          </div>
          <nav className="space-y-1" aria-label="Account">
            {SETTINGS_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "text-text-muted hover:bg-surface-muted hover:text-text",
                  collapsed && "justify-center",
                )}
                onClick={onClose}
              >
                <span className="flex-shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </a>
            ))}
            <button
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "text-text-muted hover:bg-surface-muted hover:text-text",
                collapsed && "justify-center",
              )}
            >
              <span className="flex-shrink-0" aria-hidden="true">
                <LogOut className="h-5 w-5" />
              </span>
              {!collapsed && <span>Sign out</span>}
            </button>
          </nav>
        </div>
      </div>
    </Sheet>
  );
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  actions?: ReactNode;
  showSearch?: boolean;
}

export function Header({
  onMenuClick,
  title,
  actions,
  showSearch = false,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 h-14 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center gap-4 px-4"
      role="banner"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Open menu"
        aria-controls="sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>
      {showSearch && (
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search issues..."
              className="w-full h-9 pl-10 pr-4 rounded-md bg-surface-muted border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              aria-label="Search issues"
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto">
        {actions}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
          <span className="text-sm font-medium text-accent">U</span>
        </div>
      </div>
    </header>
  );
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside id="sidebar" aria-label="Sidebar navigation" role="complementary">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className="flex-1 p-4 lg:p-6 overflow-auto"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
