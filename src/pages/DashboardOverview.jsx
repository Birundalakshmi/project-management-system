import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { motion } from 'framer-motion';
import { CheckSquare, LayoutDashboard, TrendingUp, AlertCircle, Plus, Calendar, Activity } from 'lucide-react';
import { TaskModal } from '../components/KanbanBoard'; // We will reuse the TaskModal

const Card = ({ children, className = "" }) => (
  <div className={`card p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass, borderStyle = "" }) => (
  <Card className={`flex flex-col gap-4 group card-hover relative overflow-hidden ${borderStyle}`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${colorClass}/5 rounded-full blur-2xl group-hover:bg-${colorClass}/10 transition-all`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-xl bg-background border border-slate-200 text-${colorClass} shadow-sm`}>
        <Icon size={20} className={`text-${colorClass}`} />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-black text-textColor-main tracking-tight">{value}</h3>
      <p className="text-textColor-muted text-sm font-medium mt-1">{label}</p>
    </div>
  </Card>
);

const DashboardOverview = () => {
  const { stats, projects, tasks, addTask } = useProjectData();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Formatting date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in p-8">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main">Welcome back!</h1>
          <p className="text-textColor-muted">Here's what's happening with your projects today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 font-bold px-6 py-2.5 shadow-md shadow-primary/20" onClick={() => setIsTaskModalOpen(true)}>
          <Plus size={18} /> Quick Add Task
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Projects" value={stats.totalProjects} icon={LayoutDashboard} colorClass="primary" />
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={CheckSquare} colorClass="primary" />
        <StatCard label="Completed Tasks" value={stats.completedTasks} icon={TrendingUp} colorClass="emerald-500" borderStyle="border-b-4 border-b-emerald-500" />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} icon={Activity} colorClass="amber-500" borderStyle="border-b-4 border-b-amber-500" />
        <StatCard label="Overdue Tasks" value={stats.overdueTasks} icon={AlertCircle} colorClass="rose-500" borderStyle="border-b-4 border-b-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-textColor-main flex items-center gap-2">
            <Activity size={20} className="text-primary" /> Recent Activity
          </h3>
          <Card className="shadow-sm">
             <div className="space-y-6">
               {tasks.slice(0, 5).map((task, i) => (
                 <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'inProgress' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-textColor-main">{task.title}</p>
                      <p className="text-sm text-textColor-muted line-clamp-1">{task.description}</p>
                    </div>
                    <div className="text-xs font-semibold text-textColor-muted flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(task.deadline)}
                    </div>
                 </div>
               ))}
               {tasks.length === 0 && <p className="text-textColor-muted text-center py-4">No recent activity.</p>}
             </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-textColor-main">Project Progress</h3>
          <Card className="space-y-6 shadow-sm">
            {projects.map((p, i) => {
              const projectTasks = tasks.filter(t => t.projectId === p.id);
              const completed = projectTasks.filter(t => t.status === 'done').length;
              const progress = projectTasks.length > 0 ? Math.floor((completed / projectTasks.length) * 100) : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-textColor-main font-semibold">{p.title}</span>
                    <span className="text-primary bg-primary-bg px-2 rounded font-bold text-xs">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.1 + (i * 0.1) }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && <p className="text-textColor-muted text-center py-4">No projects yet.</p>}
          </Card>
        </div>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onAdd={addTask} />
    </div>
  );
};

export default DashboardOverview;
