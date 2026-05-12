import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { Clock, Plus, Trash2, Timer } from 'lucide-react';

const TimeTracking = () => {
  const { tasks, projects, members, activeUser, timeLogs, addTimeLog, deleteTimeLog } = useProjectData();
  const [selectedTask, setSelectedTask] = useState('');
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');
  const [filterMember, setFilterMember] = useState('all');

  const handleAdd = () => {
    if (!selectedTask || !hours || isNaN(hours) || Number(hours) <= 0) return;
    addTimeLog({ taskId: selectedTask, hours: Number(hours), note, userId: activeUser.id });
    setHours('');
    setNote('');
    setSelectedTask('');
  };

  const filteredLogs = (timeLogs || []).filter(l => filterMember === 'all' || l.userId === filterMember);

  const totalHours = filteredLogs.reduce((sum, l) => sum + l.hours, 0);

  const getTaskTitle = (id) => tasks.find(t => t.id === id)?.title || 'Unknown Task';
  const getProjectName = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return projects.find(p => p.id === task?.projectId)?.title || '—';
  };
  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  // Per-member workload summary
  const memberSummary = members.map(m => ({
    ...m,
    totalHours: (timeLogs || []).filter(l => l.userId === m.id).reduce((s, l) => s + l.hours, 0)
  })).filter(m => m.totalHours > 0);

  const maxHours = Math.max(...memberSummary.map(m => m.totalHours), 1);

  return (
    <div className="p-8 animate-in space-y-6">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <Timer size={24} className="text-primary" /> Time Tracking
          </h1>
          <p className="text-textColor-muted">Log and monitor hours spent on tasks.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-textColor-main">{totalHours.toFixed(1)}h</div>
          <div className="text-xs text-textColor-muted font-semibold uppercase tracking-wider">Total Logged</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Time Form */}
        <div className="card p-6 border border-slate-200 space-y-4">
          <h3 className="font-bold text-textColor-main flex items-center gap-2"><Clock size={16} className="text-primary" /> Log Time</h3>
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Task</label>
            <select
              value={selectedTask}
              onChange={e => setSelectedTask(e.target.value)}
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 font-medium"
            >
              <option value="">Select a task...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Hours Spent</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What did you work on?"
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 font-medium"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedTask || !hours}
            className="w-full btn-primary font-bold py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Log Hours
          </button>
        </div>

        {/* Workload per member */}
        <div className="card p-6 border border-slate-200 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-textColor-main flex items-center gap-2"><Timer size={16} className="text-primary" /> Team Workload</h3>
          {memberSummary.length === 0 ? (
            <p className="text-textColor-muted text-sm text-center py-8">No time logged yet.</p>
          ) : (
            memberSummary.map(m => (
              <div key={m.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img src={m.avatar} className="w-6 h-6 rounded-full" alt={m.name} />
                    <span className="font-semibold text-textColor-main">{m.name}</span>
                  </div>
                  <span className="font-bold text-primary">{m.totalHours.toFixed(1)}h</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(m.totalHours / maxHours) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Time Logs Table */}
      <div className="card border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-textColor-main">Time Logs</h3>
          <select
            value={filterMember}
            onChange={e => setFilterMember(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Members</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-textColor-muted text-sm">No time logs found.</div>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-textColor-main text-sm">{getTaskTitle(log.taskId)}</p>
                  <p className="text-xs text-textColor-muted">{getProjectName(log.taskId)} · {getMemberName(log.userId)}{log.note ? ` · ${log.note}` : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary text-sm">{log.hours}h</span>
                  <span className="text-xs text-textColor-muted">{new Date(log.date).toLocaleDateString()}</span>
                  {log.userId === activeUser?.id && (
                    <button onClick={() => deleteTimeLog(i)} className="p-1.5 text-textColor-muted hover:text-rose-500 hover:bg-rose-50 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
