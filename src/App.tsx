import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { MonitoringDashboard } from './pages/MonitoringDashboard';
import { MindmapPage } from './pages/MindmapPage';
import { SettingsPage } from './pages/SettingsPage';
import { ScheduleSettingsPage } from './pages/ScheduleSettingsPage';
import { NotificationsSettingsPage } from './pages/NotificationsSettingsPage';
import { IntegrationsSettingsPage } from './pages/IntegrationsSettingsPage';
import { DisplaySettingsPage } from './pages/DisplaySettingsPage';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const NavLinks = ({ isMobile = false }) => (
    <>
      <Link 
        to="/dashboard" 
        className="text-sm font-medium hover:text-primary transition-colors"
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link 
        to="/tasks" 
        className="text-sm font-medium hover:text-primary transition-colors"
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        Tasks
      </Link>
      <Link 
        to="/monitoring" 
        className="text-sm font-medium hover:text-primary transition-colors"
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        Monitoring
      </Link>
      <Link 
        to="/mindmap" 
        className="text-sm font-medium hover:text-primary transition-colors"
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        Mindmap
      </Link>
    </>
  );

  const SettingsLinks = ({ isMobile = false }) => (
    <div className={`${isMobile ? '' : 'relative group'}`}>
      <Link 
        to="/settings" 
        className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
        onClick={() => {
          if (isMobile) {
            setSettingsOpen(!settingsOpen);
          }
        }}
      >
        Settings {isMobile && (settingsOpen ? '▼' : '▶')}
      </Link>
      <div className={`
        ${isMobile 
          ? `${settingsOpen ? 'block' : 'hidden'} mt-2 ml-4 space-y-2` 
          : 'absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'
        }`}>
        <div className={isMobile ? '' : 'py-1'}>
          <Link 
            to="/settings/schedule" 
            className={`block ${isMobile ? 'py-2' : 'px-4 py-2'} text-sm text-gray-700 hover:bg-gray-100`}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            Schedule
          </Link>
          <Link 
            to="/settings/notifications" 
            className={`block ${isMobile ? 'py-2' : 'px-4 py-2'} text-sm text-gray-700 hover:bg-gray-100`}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            Notifications
          </Link>
          <Link 
            to="/settings/integrations" 
            className={`block ${isMobile ? 'py-2' : 'px-4 py-2'} text-sm text-gray-700 hover:bg-gray-100`}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            Integrations
          </Link>
          <Link 
            to="/settings/display" 
            className={`block ${isMobile ? 'py-2' : 'px-4 py-2'} text-sm text-gray-700 hover:bg-gray-100`}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            Display
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="flex items-center justify-between p-4 bg-background border-b">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavLinks />
          <SettingsLinks />
        </div>
        
        {/* Mobile Navigation Button */}
        <button
          className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <NavLinks isMobile={true} />
              <SettingsLinks isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
