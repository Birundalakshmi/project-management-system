import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Users, Bell, Search,
  FolderOpen, LogOut, Moon, Sun, User, BarChart2,
  CalendarDays, Timer, GanttChartSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardOverview from '../pages/DashboardOverview';
import KanbanBoard from '../components/KanbanBoard';
import TeamManagement from '../components/TeamManagement';
import Projects from '../pages/Projects';
import Notifications from '../pages/Notifications';
import MyTasks from '../pages/MyTasks';
import ProfileSettings from '../pages/ProfileSettings';
import GanttChart from '../pages/GanttChart';
import CalendarView from '../pages/CalendarView';
import TimeTracking from '../pages/TimeTracking';
import Reports from '../pages/Reports';
import { useProjectData } from '../lib/ProjectContext';

const SidebarSectionTitle = ({ title }) => (
  <div className="px-4 mb-1 mt-5 text-[10px] font-bold text-textColor-light uppercase tracking-widest">
    {title}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full sidebar-link flex items-center justify-between ${active ? 'sidebar-link-active' : ''}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={17} className={active ? 'text-primary' : 'text-textColor-muted'} />
      <span className="flex-1 text-left text-sm">{label}</span>
    </div>
    {badge > 0 && <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

const DashboardLayout = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const { activeUser, notifications, loading, fetchError, retryFetch } = useProjectData();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => { if (onLogout) onLogout(); };
  const userInitial = activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8 card max-w-md border border-slate-200">
        <div className="text-rose-500 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-textColor-main">Connection Error</h2>
        <p className="text-sm text-textColor-muted">{fetchError}</p>
        <button onClick={retryFetch} className="btn-primary w-full font-bold py-3">Retry</button>
        <button onClick={handleLogout} className="btn-secondary w-full font-bold py-3">Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background dot-pattern font-sans text-textColor-main">
      {/* Sidebar */}
      <aside className="w-60 bg-surface border-r border-slate-200 flex flex-col z-50 shrink-0">
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-primary-bg flex items-center justify-center text-primary font-bold text-base cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all shrink-0"
              onClick={() => setActiveTab('Profile')}
              title="Profile Settings"
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-textColor-main">{activeUser?.name || 'User'}</div>
              <div className="text-xs text-textColor-muted truncate">{activeUser?.role || 'Member'}</div>
            </div>
            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-textColor-muted hover:text-textColor-main transition-all"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textColor-light" size={14} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && setActiveTab('Tasks')}
              className="w-full bg-background border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-primary/50 transition-all text-textColor-main placeholder:text-textColor-light"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide pb-4">
          <SidebarSectionTitle title="Overview" />
          <nav className="space-y-0.5">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
            <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} badge={unreadCount} />
          </nav>

          <SidebarSectionTitle title="Work" />
          <nav className="space-y-0.5">
            <SidebarItem icon={FolderOpen} label="Projects" active={activeTab === 'Projects' || activeTab === 'ProjectDetail'} onClick={() => setActiveTab('Projects')} />
            <SidebarItem icon={CheckSquare} label="My Tasks" active={activeTab === 'Tasks'} onClick={() => setActiveTab('Tasks')} />
            <SidebarItem icon={Users} label="Team" active={activeTab === 'Team'} onClick={() => setActiveTab('Team')} />
          </nav>

          <SidebarSectionTitle title="Planning" />
          <nav className="space-y-0.5">
            <SidebarItem icon={GanttChartSquare} label="Gantt Chart" active={activeTab === 'Gantt'} onClick={() => setActiveTab('Gantt')} />
            <SidebarItem icon={CalendarDays} label="Calendar" active={activeTab === 'Calendar'} onClick={() => setActiveTab('Calendar')} />
          </nav>

          <SidebarSectionTitle title="Insights" />
          <nav className="space-y-0.5">
            <SidebarItem icon={Timer} label="Time Tracking" active={activeTab === 'Time'} onClick={() => setActiveTab('Time')} />
            <SidebarItem icon={BarChart2} label="Reports" active={activeTab === 'Reports'} onClick={() => setActiveTab('Reports')} />
          </nav>

          <SidebarSectionTitle title="Account" />
          <nav className="space-y-0.5">
            <SidebarItem icon={User} label="Profile Settings" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
          </nav>
        </div>

        <div className="p-3 border-t border-slate-200">
          <button onClick={handleLogout} className="w-full sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut size={16} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full absolute inset-0 overflow-y-auto"
            >
              {activeTab === 'Dashboard'     && <DashboardOverview />}
              {activeTab === 'Projects'      && <Projects onOpenProject={(id) => { setSelectedProjectId(id); setActiveTab('ProjectDetail'); }} />}
              {activeTab === 'ProjectDetail' && <KanbanBoard projectId={selectedProjectId} onBack={() => setActiveTab('Projects')} />}
              {activeTab === 'Tasks'         && <MyTasks searchQuery={searchQuery} />}
              {activeTab === 'Team'          && <TeamManagement />}
              {activeTab === 'Notifications' && <Notifications />}
              {activeTab === 'Gantt'         && <GanttChart />}
              {activeTab === 'Calendar'      && <CalendarView />}
              {activeTab === 'Time'          && <TimeTracking />}
              {activeTab === 'Reports'       && <Reports />}
              {activeTab === 'Profile'       && <ProfileSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
