import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  FolderOpen,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardOverview from '../pages/DashboardOverview';
import KanbanBoard from '../components/KanbanBoard';
import TeamManagement from '../components/TeamManagement';
import Projects from '../pages/Projects';
import Notifications from '../pages/Notifications';
import MyTasks from '../pages/MyTasks';
import { useProjectData } from '../lib/ProjectContext';

const SidebarSectionTitle = ({ title }) => (
  <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-textColor-light uppercase tracking-widest">
    {title}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full sidebar-link flex items-center justify-between ${active ? 'sidebar-link-active' : ''}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-primary' : 'text-textColor-muted'} />
      <span className="flex-1 text-left">{label}</span>
    </div>
    {badge > 0 && <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);

const DashboardLayout = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { activeUser, notifications, loading } = useProjectData();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const userInitial = activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background dot-pattern font-sans text-textColor-main">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-bg flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
               {activeUser?.avatar ? <img src={activeUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-textColor-main">{activeUser?.name || 'User'}</div>
              <div className="text-xs text-textColor-muted truncate">{activeUser?.role || 'Member'}</div>
            </div>
          </div>
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textColor-light" size={16} />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-textColor-main placeholder:text-textColor-light"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide pb-6">
          <SidebarSectionTitle title="Main Menu" />
          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
            <SidebarItem icon={FolderOpen} label="Projects" active={activeTab === 'Projects' || activeTab === 'ProjectDetail'} onClick={() => setActiveTab('Projects')} />
            <SidebarItem icon={CheckSquare} label="My Tasks" active={activeTab === 'Tasks'} onClick={() => setActiveTab('Tasks')} />
            <SidebarItem icon={Users} label="Team" active={activeTab === 'Team'} onClick={() => setActiveTab('Team')} />
            <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} badge={unreadCount} />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="w-full sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50 mt-1">
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Dynamic Sub-Page Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full absolute inset-0 overflow-y-auto"
            >
              {activeTab === 'Dashboard' && <DashboardOverview />}
              {activeTab === 'Projects' && <Projects onOpenProject={(id) => { setSelectedProjectId(id); setActiveTab('ProjectDetail'); }} />}
              {activeTab === 'ProjectDetail' && <KanbanBoard projectId={selectedProjectId} onBack={() => setActiveTab('Projects')} />}
              {activeTab === 'Tasks' && <MyTasks />}
              {activeTab === 'Team' && <TeamManagement />}
              {activeTab === 'Notifications' && <Notifications />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
