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

const Navigation = () => (
  <nav className="flex items-center gap-4 p-4 bg-background border-b">
    <Link 
      to="/dashboard" 
      className="text-sm font-medium hover:text-primary transition-colors"
    >
      Dashboard
    </Link>
    <Link 
      to="/tasks" 
      className="text-sm font-medium hover:text-primary transition-colors"
    >
      Tasks
    </Link>
    <Link 
      to="/monitoring" 
      className="text-sm font-medium hover:text-primary transition-colors"
    >
      Monitoring
    </Link>
    <Link 
      to="/mindmap" 
      className="text-sm font-medium hover:text-primary transition-colors"
    >
      Mindmap
    </Link>
    <div className="relative group">
      <Link 
        to="/settings" 
        className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
      >
        Settings
      </Link>
      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          <Link 
            to="/settings/schedule" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Schedule
          </Link>
          <Link 
            to="/settings/notifications" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Notifications
          </Link>
          <Link 
            to="/settings/integrations" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Integrations
          </Link>
          <Link 
            to="/settings/display" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Display
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto py-6">
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
