import * as React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { cn } from "./lib/utils";
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { Button } from './components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { api } from './services/api';
import { MonitoringDashboard } from './pages/MonitoringDashboard';
import { MindmapPage } from './pages/MindmapPage';
import { SettingsPage } from './pages/SettingsPage';
import { TeamCollaborationPage } from './pages/TeamCollaborationPage';
import { ValueStreamAnalysisPage } from './pages/ValueStreamAnalysisPage';
import { OrganizationDashboard } from './pages/OrganizationDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { ScheduleSettingsPage } from './pages/ScheduleSettingsPage';
import { NotificationsSettingsPage } from './pages/NotificationsSettingsPage';
import { IntegrationsSettingsPage } from './pages/IntegrationsSettingsPage';
import { DisplaySettingsPage } from './pages/DisplaySettingsPage';

interface NavigationProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

interface NavLinksProps {
  isMobile?: boolean;
}

interface SettingsLinksProps {
  isMobile?: boolean;
}

const Navigation = ({ isDark, onThemeToggle }: NavigationProps): JSX.Element => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const location = useLocation();
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const mobileButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handle click outside to close mobile menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
          mobileButtonRef.current && !mobileButtonRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close mobile menu
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/settings') {
      return location.pathname.startsWith('/settings');
    }
    return location.pathname === path || location.pathname === path + '/';
  };

  const NavLinks = ({ isMobile = false }: NavLinksProps): JSX.Element => (
    <div
      className={cn(
        "flex",
        isMobile ? "flex-col gap-2" : "items-center gap-1"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link
        to="/dashboard"
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isActive('/dashboard')
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
        )}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        aria-current={isActive('/dashboard') ? 'page' : undefined}
        role="menuitem"
      >
        Dashboard
      </Link>
        <Link
          to="/tasks"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/tasks')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/tasks') ? 'page' : undefined}
          role="menuitem"
        >
          Tasks
        </Link>
        <Link
          to="/monitoring"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/monitoring')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/monitoring') ? 'page' : undefined}
          role="menuitem"
        >
          Monitoring
        </Link>
        <Link
          to="/mindmap"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/mindmap')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/mindmap') ? 'page' : undefined}
          role="menuitem"
        >
          Mindmap
        </Link>
        <Link
          to="/valuestream"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/valuestream')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/valuestream') ? 'page' : undefined}
          role="menuitem"
        >
          Value Stream
        </Link>
        <Link
          to="/organization"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/organization')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/organization') ? 'page' : undefined}
          role="menuitem"
        >
          Organization
        </Link>
        <Link
          to="/security"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/security')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/security') ? 'page' : undefined}
          role="menuitem"
        >
          Security
        </Link>
        <Link
          to="/collaboration"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isActive('/collaboration')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          aria-current={isActive('/collaboration') ? 'page' : undefined}
          role="menuitem"
        >
          Team Collaboration
        </Link>
      </div>
  );

  const SettingsLinks = ({ isMobile = false }: SettingsLinksProps): JSX.Element => (
    <div className={cn("relative", isMobile ? "" : "group")} role="navigation" aria-label="Settings menu">
      <Link
        to="/settings"
        className={cn(
          "text-sm font-medium transition-all duration-200 flex items-center gap-1 px-3 py-2 rounded-full",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isActive('/settings')
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
        )}
        onClick={() => {
          if (isMobile) {
            setSettingsOpen(!settingsOpen);
          }
        }}
        role="menuitem"
        aria-expanded={settingsOpen}
        aria-haspopup="true"
        aria-controls="settings-dropdown"
        aria-current={isActive('/settings') ? 'page' : undefined}
      >
        Settings {isMobile && (
          <span className="ml-1 transition-transform duration-200" aria-hidden="true">
            {settingsOpen ? '▼' : '▶'}
          </span>
        )}
      </Link>
      <div
        id="settings-dropdown"
        className={cn(
          "mt-2",
          isMobile
            ? cn("ml-4 space-y-2", settingsOpen ? "block" : "hidden")
            : cn(
                "absolute left-0 w-48 rounded-lg shadow-lg bg-background/95 backdrop-blur-sm",
                "ring-1 ring-black/5 dark:ring-white/10",
                "opacity-0 invisible -translate-y-2",
                "group-hover:opacity-100 group-hover:visible group-hover:translate-y-0",
                "focus-within:opacity-100 focus-within:visible focus-within:translate-y-0",
                "transition-all duration-200 ease-out transform-gpu"
              )
        )}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="settings-menu"
      >
        <div className={cn(
          "py-1",
          isMobile ? "space-y-1" : ""
        )}>
          <Link
            to="/settings/schedule"
            className={cn(
              "block w-full text-left px-4 py-2 text-sm",
              "transition-colors duration-150",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent/10 active:bg-accent/20",
              "focus:outline-none focus:bg-accent/10 focus:ring-2 focus:ring-primary focus:ring-inset",
              "first:rounded-t-lg last:rounded-b-lg",
              isActive('/settings/schedule') ? "bg-primary/10 text-primary font-medium" : ""
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            role="menuitem"
            tabIndex={0}
          >
            Schedule
          </Link>
          <Link
            to="/settings/notifications"
            className={cn(
              "block w-full text-left px-4 py-2 text-sm text-gray-700",
              "transition-colors duration-150",
              "hover:bg-gray-100 hover:text-gray-900",
              "focus:outline-none focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-primary focus:ring-inset",
              isActive('/settings/notifications') ? "text-primary font-bold bg-gray-50" : ""
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            role="menuitem"
            tabIndex={0}
          >
            Notifications
          </Link>
          <Link
            to="/settings/integrations"
            className={cn(
              "block w-full text-left px-4 py-2 text-sm text-gray-700",
              "transition-colors duration-150",
              "hover:bg-gray-100 hover:text-gray-900",
              "focus:outline-none focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-primary focus:ring-inset",
              isActive('/settings/integrations') ? "text-primary font-bold bg-gray-50" : ""
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            role="menuitem"
            tabIndex={0}
          >
            Integrations
          </Link>
          <Link
            to="/settings/display"
            className={cn(
              "block w-full text-left px-4 py-2 text-sm text-gray-700",
              "transition-colors duration-150",
              "hover:bg-gray-100 hover:text-gray-900",
              "focus:outline-none focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-primary focus:ring-inset",
              isActive('/settings/display') ? "text-primary font-bold bg-gray-50" : ""
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            role="menuitem"
            tabIndex={0}
          >
            Display
          </Link>
        </div>
      </div>
    </div>
    );

  return (
    <>
      <nav className="flex items-center justify-betweez py-5 px-6 bg-background border-b shadow-sm" role="navigation">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 flex-1" role="menubar" aria-label="Main navigation">
          <div className="flex items-center gap-1 flex-1">
            <NavLinks />
          </div>
          <div className="flex items-center gap-4" role="toolbar" aria-label="User actions">
            <SettingsLinks />
            <div className="h-6 w-px bg-border/50" aria-hidden="true" /> {/* Vertical divider */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full hover:bg-accent/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme (current: ${isDark ? "dark" : "light"})`}
              role="switch"
              aria-checked={isDark}
              tabIndex={0}
            >
              <span className="sr-only">
                Switch to {isDark ? "light" : "dark"} theme (current: {isDark ? "dark" : "light"})
              </span>
              {isDark ? (
                <Moon className="h-5 w-5 transition-transform hover:scale-110" aria-hidden="true" />
              ) : (
                <Sun className="h-5 w-5 transition-transform hover:scale-110" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center justify-between w-full px-4" role="menubar" aria-label="Mobile navigation">
        <button
          ref={mobileButtonRef}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-haspopup="true"
          tabIndex={0}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            role="img"
            aria-label={mobileMenuOpen ? "Close icon" : "Menu icon"}
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <Button
          ref={mobileButtonRef}
          variant="outline"
          size="icon"
          onClick={onThemeToggle}
          className={cn(
            "md:hidden self-start mt-2 w-9 h-9 transition-all duration-200",
            "hover:bg-accent/10 active:bg-accent/20",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isDark ? "hover:text-amber-500" : "hover:text-sky-500"
          )}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme (current: ${isDark ? "dark" : "light"})`}
          title={`Switch to ${isDark ? "light" : "dark"} theme`}
        >
          <span className="sr-only">
            Switch to {isDark ? "light" : "dark"} theme (current: {isDark ? "dark" : "light"})
          </span>
          {isDark ? (
            <Moon className="h-5 w-5 transition-all duration-200 transform hover:scale-110 hover:rotate-12" />
          ) : (
            <Sun className="h-5 w-5 transition-all duration-200 transform hover:scale-110 hover:rotate-12" />
          )}
        </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transform-gpu",
          "transition-all duration-300 ease-in-out will-change-opacity will-change-transform",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        aria-hidden={!mobileMenuOpen}
        style={{
          visibility: mobileMenuOpen ? 'visible' : 'hidden',
          transitionProperty: 'opacity, visibility',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className={cn(
            "fixed inset-y-0 left-0 w-full max-w-xs bg-background p-6 shadow-lg transform-gpu",
            "transition-transform duration-300 ease-in-out will-change-transform",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          role="menu"
          aria-orientation="vertical"
          aria-label="Mobile navigation menu"
          tabIndex={-1}
        >
          <div className="flex flex-col gap-4">
            <NavLinks isMobile={true} />
            <SettingsLinks isMobile={true} />
          </div>
        </div>
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    return savedTheme === 'dark';
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        const settings = await api.getSettings('current');
        const theme = settings.display.theme;
        setIsDark(theme === 'dark');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
      } catch (err) {
        console.error('Failed to load display settings:', err);
        // Fall back to localStorage if API fails
        const savedTheme = localStorage.getItem('theme') || 'light';
        setIsDark(savedTheme === 'dark');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    };

    fetchInitialSettings();
  }, []);

  const handleThemeToggle = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    try {
      // Update server first
      await api.updateDisplay('current', {
        theme: newTheme,
        compactView: false, // Preserve existing settings
        showAchievements: true,
        defaultView: 'board'
      });

      // If server update succeeds, update local state
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setIsDark(!isDark);
      setError(null);
    } catch (err) {
      console.error('Failed to update theme:', err);
      setError('Failed to update theme. Please try again.');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">
            {error}
          </div>
        )}
        <Navigation isDark={isDark} onThemeToggle={handleThemeToggle} />
        <main className="container mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailsPage />} />
            <Route path="/monitoring" element={<MonitoringDashboard />} />
            <Route path="/mindmap" element={<MindmapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/schedule" element={<ScheduleSettingsPage />} />
            <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
            <Route path="/settings/integrations" element={<IntegrationsSettingsPage />} />
            <Route path="/settings/display" element={<DisplaySettingsPage />} />
            <Route path="/collaboration" element={<TeamCollaborationPage />} />
            <Route path="/valuestream" element={<ValueStreamAnalysisPage />} />
            <Route path="/organization" element={<OrganizationDashboard />} />
            <Route path="/security" element={<SecurityDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
