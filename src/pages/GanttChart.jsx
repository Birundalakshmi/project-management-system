import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const GanttChart = () => {
  const { projects, tasks } = useProjectData();
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const project = projects.find(p => p.id === selectedProject);
  const projectTasks = tasks.filter(t => t.projectId === selectedProject && t.deadline);

  const getDayOfYear = (dateStr) => {
    const d = new Date(dateStr);
    const start = new Date(viewYear, 0, 1);
    const diff = d - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = 365;

  const getBar = (task) => {
    if (!task.deadline) return null;
    const created = task.created_at ? new Date(task.created_at) : new Date(task.deadline);
    const createdYear = created.getFullYear();
    const deadlineYear = new Date(task.deadline).getFullYear();

    const startDay = createdYear === viewYear ? getDayOfYear(created) : (createdYear < viewYear ? 1 : null);
    const endDay = deadlineYear === viewYear ? getDayOfYear(task.deadline) : (deadlineYear > viewYear ? totalDays : null);

    if (startDay === null || endDay === null) return null;

    const left = ((Math.max(1, startDay) / totalDays) * 100).toFixed(2);
    const width = (((Math.min(totalDays, endDay) - Math.max(1, startDay)) / totalDays) * 100).toFixed(2);

    return { left: `${left}%`, width: `${Math.max(1, width)}%` };
  };

  const statusColor = (status) => {
    if (status === 'done') return 'bg-emerald-500';
    if (status === 'inProgress') return 'bg-amber-400';
    return 'bg-primary';
  };

  return (
    <div className="p-8 animate-in space-y-6">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <BarChart2 size={24} className="text-primary" /> Gantt Chart
          </h1>
          <p className="text-textColor-muted">Visual timeline of task deadlines per project.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewYear(y => y - 1)} className="p-2 btn-secondary rounded-lg"><ChevronLeft size={16} /></button>
          <span className="font-bold text-textColor-main w-12 text-center">{viewYear}</span>
          <button onClick={() => setViewYear(y => y + 1)} className="p-2 btn-secondary rounded-lg"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProject(p.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              selectedProject === p.id ? 'bg-primary text-white border-primary' : 'bg-surface text-textColor-muted border-slate-200 hover:border-slate-300'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {!project ? (
        <div className="text-center py-16 text-textColor-muted">No project selected.</div>
      ) : (
        <div className="card border border-slate-200 overflow-hidden">
          {/* Month headers */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="w-48 shrink-0 px-4 py-3 text-xs font-bold text-textColor-muted uppercase tracking-widest border-r border-slate-200">Task</div>
            <div className="flex-1 grid grid-cols-12">
              {MONTHS.map(m => (
                <div key={m} className="text-center py-3 text-xs font-bold text-textColor-muted border-r border-slate-100 last:border-0">{m}</div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-slate-100">
            {projectTasks.length === 0 && (
              <div className="text-center py-12 text-textColor-muted text-sm">No tasks with deadlines in this project.</div>
            )}
            {projectTasks.map(task => {
              const bar = getBar(task);
              return (
                <div key={task.id} className="flex items-center hover:bg-slate-50 transition-colors">
                  <div className="w-48 shrink-0 px-4 py-3 border-r border-slate-100">
                    <p className="text-sm font-semibold text-textColor-main truncate">{task.title}</p>
                    <p className="text-[10px] text-textColor-muted capitalize">{task.status}</p>
                  </div>
                  <div className="flex-1 relative h-12 px-2">
                    {bar && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full ${statusColor(task.status)} opacity-80 flex items-center px-2`}
                        style={{ left: bar.left, width: bar.width }}
                        title={`${task.title} — Due: ${new Date(task.deadline).toLocaleDateString()}`}
                      >
                        <span className="text-[10px] text-white font-bold truncate">{task.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-textColor-muted"><div className="w-3 h-3 rounded-full bg-primary"></div> To Do</div>
            <div className="flex items-center gap-2 text-xs text-textColor-muted"><div className="w-3 h-3 rounded-full bg-amber-400"></div> In Progress</div>
            <div className="flex items-center gap-2 text-xs text-textColor-muted"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Completed</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
