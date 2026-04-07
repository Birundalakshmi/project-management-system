import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { CheckCircle2, Clock, Calendar, CheckSquare, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyTasks = () => {
  const { tasks, projects, activeUser, updateTaskStatus } = useProjectData();
  const [search, setSearch] = useState('');

  if (!activeUser) return <div className="p-8">Please log in to view tasks.</div>;

  const myTasks = tasks.filter(t => t.assigneeId === activeUser.id);
  const filteredTasks = myTasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const pendingTasks = filteredTasks.filter(t => t.status !== 'done');
  const completedTasks = filteredTasks.filter(t => t.status === 'done');

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
  };

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTaskStatus(task.id, newStatus);
  };

  return (
    <div className="p-8 animate-in space-y-6 max-w-5xl mx-auto flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <CheckSquare size={24} className="text-primary" /> My Tasks
          </h2>
          <p className="text-textColor-muted mt-1">Cross-project view of everything assigned to you.</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="text-right">
               <div className="text-2xl font-bold text-textColor-main leading-none">{pendingTasks.length}</div>
               <div className="text-[10px] uppercase font-bold text-textColor-light tracking-wider mt-1">Pending</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-right">
               <div className="text-2xl font-bold text-textColor-main leading-none">{completedTasks.length}</div>
               <div className="text-[10px] uppercase font-bold text-textColor-light tracking-wider mt-1">Done</div>
            </div>
        </div>
      </div>

      <div className="card flex-1 flex flex-col !p-0 overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
          <Search size={18} className="text-textColor-light" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your tasks..." 
            className="bg-transparent border-none focus:outline-none text-sm text-textColor-main w-full placeholder:text-textColor-light font-medium"
          />
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
             
          {/* Pending Tasks Section */}
          <div>
            <h3 className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={14} /> To Do & In Progress
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {pendingTasks.length === 0 ? (
                    <div className="text-center py-6 border-2 border-slate-200 border-dashed rounded-xl text-textColor-muted text-sm font-medium">No pending tasks matching your search.</div>
                ) : (
                    pendingTasks.map(task => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={task.id} 
                          className="flex items-center gap-4 p-4 bg-background border border-slate-200 rounded-xl hover:border-primary/40 transition-colors shadow-sm group"
                        >
                            <button 
                              onClick={() => toggleTaskStatus(task)} 
                              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-transparent hover:border-primary hover:text-primary transition-all shrink-0"
                            >
                                <CheckCircle2 size={14} />
                            </button>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-textColor-main truncate text-sm">{task.title}</h4>
                                <div className="flex items-center gap-3 mt-1.5 opacity-80">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[150px]">
                                        {getProjectName(task.projectId)}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                                        task.priority === 'High' ? 'text-badge-high-text bg-badge-high-bg' : 
                                        task.priority === 'Medium' ? 'text-badge-medium-text bg-badge-medium-bg' : 
                                        'text-badge-low-text bg-badge-low-bg'
                                    }`}>
                                        {task.priority || 'Low'}
                                    </span>
                                    {task.deadline && (
                                        <span className="text-[10px] font-semibold text-textColor-light flex items-center gap-1">
                                            <Calendar size={10}/> {new Date(task.deadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Completed Tasks Section */}
          <div>
            <h3 className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} /> Completed
            </h3>
            <div className="space-y-3 opacity-60">
              <AnimatePresence>
                {completedTasks.length === 0 ? (
                    <div className="text-center py-6 border border-slate-100 rounded-xl text-textColor-muted text-sm font-medium">No completed tasks yet.</div>
                ) : (
                    completedTasks.map(task => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={task.id} 
                          className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                        >
                            <button 
                              onClick={() => toggleTaskStatus(task)} 
                              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shrink-0"
                            >
                                <CheckCircle2 size={14} />
                            </button>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-500 line-through truncate text-sm">{task.title}</h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-500 truncate max-w-[150px]">
                                        {getProjectName(task.projectId)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyTasks;
