import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { BarChart2, TrendingUp, Users, CheckSquare, AlertCircle, Clock } from 'lucide-react';

const Bar = ({ value, max, color = 'bg-primary', label, sublabel }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="font-semibold text-textColor-main truncate max-w-[160px]">{label}</span>
      <span className="font-bold text-textColor-muted">{sublabel}</span>
    </div>
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      />
    </div>
  </div>
);

const StatBox = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 border border-slate-200 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <div className="text-2xl font-black text-textColor-main">{value}</div>
      <div className="text-xs text-textColor-muted font-semibold">{label}</div>
    </div>
  </div>
);

const Reports = () => {
  const { projects, tasks, members, timeLogs = [] } = useProjectData();
  const [activeReport, setActiveReport] = useState('tasks');

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length;
  const totalHours = timeLogs.reduce((s, l) => s + l.hours, 0);

  // Per-project stats
  const projectStats = projects.map(p => {
    const pt = tasks.filter(t => t.projectId === p.id);
    const done = pt.filter(t => t.status === 'done').length;
    const progress = pt.length > 0 ? Math.round((done / pt.length) * 100) : 0;
    return { ...p, total: pt.length, done, progress };
  });

  // Per-member stats
  const memberStats = members.map(m => {
    const assigned = tasks.filter(t => t.assigneeId === m.id).length;
    const done = tasks.filter(t => t.assigneeId === m.id && t.status === 'done').length;
    const hours = timeLogs.filter(l => l.userId === m.id).reduce((s, l) => s + l.hours, 0);
    return { ...m, assigned, done, hours };
  });

  // Priority breakdown
  const highTasks = tasks.filter(t => t.priority === 'High').length;
  const medTasks = tasks.filter(t => t.priority === 'Medium').length;
  const lowTasks = tasks.filter(t => t.priority === 'Low').length;

  const TABS = [
    { id: 'tasks', label: 'Task Report' },
    { id: 'projects', label: 'Project Report' },
    { id: 'members', label: 'Member Performance' },
  ];

  return (
    <div className="p-8 animate-in space-y-6">
      <div className="bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
          <BarChart2 size={24} className="text-primary" /> Reports & Analytics
        </h1>
        <p className="text-textColor-muted">Visual insights into your project performance.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatBox icon={CheckSquare} label="Total Tasks" value={tasks.length} color="bg-primary" />
        <StatBox icon={TrendingUp} label="Completed" value={completedTasks} color="bg-emerald-500" />
        <StatBox icon={Clock} label="In Progress" value={inProgressTasks} color="bg-amber-500" />
        <StatBox icon={AlertCircle} label="Overdue" value={overdueTasks} color="bg-rose-500" />
        <StatBox icon={Users} label="Hours Logged" value={`${totalHours.toFixed(1)}h`} color="bg-violet-500" />
      </div>

      {/* Report tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveReport(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              activeReport === t.id ? 'bg-primary text-white border-primary' : 'bg-surface text-textColor-muted border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Task Report */}
      {activeReport === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-textColor-main">Task Status Breakdown</h3>
            <Bar value={completedTasks} max={tasks.length} color="bg-emerald-500" label="Completed" sublabel={`${completedTasks} tasks`} />
            <Bar value={inProgressTasks} max={tasks.length} color="bg-amber-400" label="In Progress" sublabel={`${inProgressTasks} tasks`} />
            <Bar value={todoTasks} max={tasks.length} color="bg-slate-400" label="To Do" sublabel={`${todoTasks} tasks`} />
            <Bar value={overdueTasks} max={tasks.length} color="bg-rose-500" label="Overdue" sublabel={`${overdueTasks} tasks`} />
          </div>
          <div className="card p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-textColor-main">Priority Breakdown</h3>
            <Bar value={highTasks} max={tasks.length} color="bg-rose-500" label="High Priority" sublabel={`${highTasks} tasks`} />
            <Bar value={medTasks} max={tasks.length} color="bg-amber-400" label="Medium Priority" sublabel={`${medTasks} tasks`} />
            <Bar value={lowTasks} max={tasks.length} color="bg-blue-400" label="Low Priority" sublabel={`${lowTasks} tasks`} />
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-textColor-muted">Completion Rate</span>
                <span className="font-bold text-emerald-600">
                  {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Report */}
      {activeReport === 'projects' && (
        <div className="card p-6 border border-slate-200 space-y-5">
          <h3 className="font-bold text-textColor-main">Project Progress</h3>
          {projectStats.length === 0 && <p className="text-textColor-muted text-sm text-center py-8">No projects yet.</p>}
          {projectStats.map(p => (
            <div key={p.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-semibold text-textColor-main">{p.title}</span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>{p.status}</span>
                </div>
                <span className="font-bold text-primary">{p.progress}% · {p.done}/{p.total} tasks</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Performance */}
      {activeReport === 'members' && (
        <div className="card border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs font-bold text-textColor-muted uppercase tracking-widest">
            <div className="col-span-2">Member</div>
            <div className="text-center">Assigned</div>
            <div className="text-center">Completed</div>
            <div className="text-center">Hours Logged</div>
          </div>
          <div className="divide-y divide-slate-100">
            {memberStats.length === 0 && (
              <div className="text-center py-10 text-textColor-muted text-sm">No members yet.</div>
            )}
            {memberStats.map(m => (
              <div key={m.id} className="grid grid-cols-5 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <img src={m.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt={m.name} />
                  <div>
                    <p className="font-semibold text-textColor-main text-sm">{m.name}</p>
                    <p className="text-xs text-textColor-muted">{m.role}</p>
                  </div>
                </div>
                <div className="text-center font-bold text-textColor-main">{m.assigned}</div>
                <div className="text-center">
                  <span className="font-bold text-emerald-600">{m.done}</span>
                  <span className="text-textColor-muted text-xs"> / {m.assigned}</span>
                </div>
                <div className="text-center font-bold text-primary">{m.hours.toFixed(1)}h</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
