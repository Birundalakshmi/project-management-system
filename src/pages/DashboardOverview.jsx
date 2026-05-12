import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { motion } from 'framer-motion';
import { CheckSquare, LayoutDashboard, TrendingUp, AlertCircle, Plus, Calendar, Activity, Timer, Users, Flag } from 'lucide-react';
import { TaskModal } from '../components/KanbanBoard';

const StatCard = ({ label, value, icon: Icon, color, border = '' }) => (
  <div className={`card p-5 flex flex-col gap-3 card-hover relative overflow-hidden border border-slate-200 ${border}`}>
    <div className={`p-2.5 rounded-xl w-fit border border-slate-200 bg-background`}>
      <Icon size={18} className={color} />
    </div>
    <div>
      <h3 className="text-2xl font-black text-textColor-main tracking-tight">{value}</h3>
      <p className="text-textColor-muted text-xs font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

const DashboardOverview = () => {
  const { stats, projects, tasks, members, timeLogs = [], addTask, activeUser } = useProjectData();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const totalHours = timeLogs.reduce((s, l) => s + l.hours, 0);
  const completionRate = tasks.length > 0 ? Math.round((stats.completedTasks / tasks.length) * 100) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Upcoming deadlines (next 7 days, not done)
  const now = new Date();
  const in7 = new Date(); in7.setDate(now.getDate() + 7);
  const upcoming = tasks
    .filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) >= now && new Date(t.deadline) <= in7)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  // Overdue tasks
  const overdue = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < now).slice(0, 3);

  return (
    <div className="space-y-6 animate-in p-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main">
            Welcome back, {activeUser?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-textColor-muted text-sm mt-1">Here's your project overview for today.</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 font-bold px-5 py-2.5 shadow-md shadow-primary/20 text-sm"
          onClick={() => setIsTaskModalOpen(true)}
        >
          <Plus size={16} /> Quick Add Task
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Projects" value={stats.totalProjects} icon={LayoutDashboard} color="text-primary" />
        <StatCard label="Total Tasks" value={stats.totalTasks} icon={CheckSquare} color="text-primary" />
        <StatCard label="Completed" value={stats.completedTasks} icon={TrendingUp} color="text-emerald-500" border="border-b-4 border-b-emerald-500" />
        <StatCard label="In Progress" value={tasks.filter(t => t.status === 'inProgress').length} icon={Activity} color="text-amber-500" border="border-b-4 border-b-amber-500" />
        <StatCard label="Overdue" value={stats.overdueTasks} icon={AlertCircle} color="text-rose-500" border="border-b-4 border-b-rose-500" />
        <StatCard label="Hours Logged" value={`${totalHours.toFixed(1)}h`} icon={Timer} color="text-violet-500" border="border-b-4 border-b-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-textColor-main flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Project Progress
          </h3>
          <div className="card p-6 border border-slate-200 space-y-5">
            {projects.length === 0 && <p className="text-textColor-muted text-sm text-center py-4">No projects yet.</p>}
            {projects.map((p, i) => {
              const pt = tasks.filter(t => t.projectId === p.id);
              const done = pt.filter(t => t.status === 'done').length;
              const progress = pt.length > 0 ? Math.floor((done / pt.length) * 100) : 0;
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-textColor-main">{p.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>{p.status}</span>
                    </div>
                    <span className="font-bold text-primary text-xs bg-primary-bg px-2 py-0.5 rounded">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <div className="text-xs text-textColor-muted">{done}/{pt.length} tasks · Deadline: {formatDate(p.deadline)}</div>
                </div>
              );
            })}
          </div>

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <div className="card p-5 border border-rose-200 bg-rose-50 space-y-3">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2"><AlertCircle size={16} /> Overdue Tasks</h3>
              {overdue.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-rose-700">{t.title}</span>
                  <span className="text-xs text-rose-500 font-semibold">{formatDate(t.deadline)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Upcoming deadlines */}
          <h3 className="text-base font-bold text-textColor-main flex items-center gap-2">
            <Flag size={18} className="text-primary" /> Upcoming (7 days)
          </h3>
          <div className="card p-5 border border-slate-200 space-y-3">
            {upcoming.length === 0 && <p className="text-textColor-muted text-sm text-center py-4">No upcoming deadlines.</p>}
            {upcoming.map(t => {
              const project = projects.find(p => p.id === t.projectId);
              const assignee = members.find(m => m.id === t.assigneeId);
              return (
                <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    t.priority === 'High' ? 'bg-rose-400' : t.priority === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-textColor-main text-sm truncate">{t.title}</p>
                    <p className="text-xs text-textColor-muted">{project?.title || '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-amber-600">{formatDate(t.deadline)}</div>
                    {assignee && <img src={assignee.avatar} className="w-5 h-5 rounded-full mt-1 ml-auto" alt={assignee.name} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team summary */}
          <h3 className="text-base font-bold text-textColor-main flex items-center gap-2">
            <Users size={18} className="text-primary" /> Team
          </h3>
          <div className="card p-5 border border-slate-200 space-y-3">
            {members.slice(0, 5).map(m => {
              const assigned = tasks.filter(t => t.assigneeId === m.id && t.status !== 'done').length;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <img src={m.avatar} className="w-8 h-8 rounded-full border border-slate-200 shrink-0" alt={m.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textColor-main truncate">{m.name}</p>
                    <p className="text-xs text-textColor-muted">{m.role}</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary-bg px-2 py-0.5 rounded">{assigned} tasks</span>
                </div>
              );
            })}
            {members.length === 0 && <p className="text-textColor-muted text-sm text-center py-2">No team members yet.</p>}
          </div>
        </div>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onAdd={addTask} />
    </div>
  );
};

export default DashboardOverview;
