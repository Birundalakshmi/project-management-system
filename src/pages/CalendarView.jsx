import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CalendarView = () => {
  const { tasks, projects } = useProjectData();
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const getTasksForDay = (day) => {
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline && t.deadline.slice(0, 10) === dateStr);
  };

  const isToday = (day) =>
    day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();

  const prevMonth = () => setCurrent(c => {
    if (c.month === 0) return { year: c.year - 1, month: 11 };
    return { ...c, month: c.month - 1 };
  });

  const nextMonth = () => setCurrent(c => {
    if (c.month === 11) return { year: c.year + 1, month: 0 };
    return { ...c, month: c.month + 1 };
  });

  const priorityDot = (priority) => {
    if (priority === 'High') return 'bg-rose-400';
    if (priority === 'Medium') return 'bg-amber-400';
    return 'bg-blue-400';
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-8 animate-in space-y-6">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <CalendarDays size={24} className="text-primary" /> Calendar View
          </h1>
          <p className="text-textColor-muted">Tasks organized by due date.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 btn-secondary rounded-lg"><ChevronLeft size={16} /></button>
          <span className="font-bold text-textColor-main w-36 text-center">{MONTHS_FULL[current.month]} {current.year}</span>
          <button onClick={nextMonth} className="p-2 btn-secondary rounded-lg"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="card border border-slate-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-textColor-muted uppercase tracking-widest">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayTasks = day ? getTasksForDay(day) : [];
            return (
              <div
                key={idx}
                className={`min-h-[100px] p-2 border-b border-r border-slate-100 last:border-r-0 ${!day ? 'bg-slate-50/50' : 'hover:bg-slate-50 transition-colors'}`}
              >
                {day && (
                  <>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${
                      isToday(day) ? 'bg-primary text-white' : 'text-textColor-main'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(t.priority)}`}></div>
                          <span className="text-[10px] font-semibold text-primary truncate">{t.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-textColor-muted font-semibold pl-1">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-textColor-muted"><div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div> High Priority</div>
        <div className="flex items-center gap-2 text-xs text-textColor-muted"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Medium Priority</div>
        <div className="flex items-center gap-2 text-xs text-textColor-muted"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Low Priority</div>
      </div>
    </div>
  );
};

export default CalendarView;
