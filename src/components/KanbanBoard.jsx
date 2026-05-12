import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, AlignLeft, MessageSquare, ArrowLeft, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useProjectData } from '../lib/ProjectContext';
import ConfirmDialog from './ConfirmDialog';

const getDeadlineStyle = (deadline, status) => {
  if (!deadline || status === 'done') return { cls: 'text-textColor-light', label: null };
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(deadline); due.setHours(0,0,0,0);
  if (due < today) return { cls: 'text-rose-500 font-bold', label: 'Overdue' };
  if (due.getTime() === today.getTime()) return { cls: 'text-amber-500 font-bold', label: 'Due today' };
  return { cls: 'text-textColor-light', label: null };
};

export const TaskModal = ({ isOpen, onClose, onAdd, projectId = null }) => {
  const { projects, activeUser } = useProjectData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || (projects.length > 0 ? projects[0].id : ''));

  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0 && !projectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId, projectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId) return;
    onAdd({
      projectId: selectedProjectId,
      title,
      description,
      priority,
      deadline,
      status: 'todo',
      assigneeId: activeUser?.id || null,
    });
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('Medium');
    setSelectedProjectId(projectId || (projects.length > 0 ? projects[0].id : ''));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-md p-6 relative border border-slate-200"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-textColor-muted hover:text-textColor-main">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-textColor-main mb-6">Create New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!projectId && (
            <div>
              <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Project</label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-background border border-slate-200 rounded-xl py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task name"
              className="w-full bg-background border border-slate-200 rounded-xl py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Details..."
              className="w-full bg-background border border-slate-200 rounded-xl py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all h-24 resize-none font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-background border border-slate-200 rounded-xl py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Deadline</label>
              <input 
                type="date" 
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-background border border-slate-200 rounded-xl py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary font-bold py-3 mt-4 text-sm tracking-wide">Create Task</button>
        </form>
      </motion.div>
    </div>
  );
};

const AssigneeAvatar = ({ assigneeId }) => {
  const { members } = useProjectData();
  const member = members.find(m => m.id === assigneeId);

  if (!member) {
    return (
      <div className="w-6 h-6 rounded-full bg-white border border-slate-300 border-dashed flex items-center justify-center text-[10px] text-textColor-muted shadow-sm" title="Unassigned">
        <Plus size={12} />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-full bg-primary-bg border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm" title={member.name}>
      {member.name?.charAt(0).toUpperCase()}
    </div>
  );
};

const TaskDetailModal = ({ task, isOpen, onClose }) => {
  const { members, updateTask, assignTask, addTaskComment, updateTaskStatus, deleteTask } = useProjectData();
  const [commentText, setCommentText] = useState('');
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !task) return null;

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText);
    setCommentText('');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const assignee = members.find(m => m.id === task.assigneeId);

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-slate-200 z-50 flex flex-col pt-4 pb-6 px-6 transform transition-transform duration-300 overflow-y-auto overflow-x-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-lg text-textColor-main leading-tight flex items-center gap-2">
              {task.title}
            </h2>
            <div className="text-xs text-textColor-muted mt-0.5">Edit Task Details</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setConfirmDelete(true)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-textColor-muted hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-textColor-muted hover:text-textColor-main hover:bg-slate-50 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Metadata Grid */}
        <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="grid grid-cols-12 gap-4 text-sm items-center">
            <div className="col-span-4 text-textColor-muted font-medium">Assignee</div>
            <div className="col-span-8 relative">
                <div 
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5 cursor-pointer hover:border-primary/50 w-full"
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                >
                  {assignee ? (
                    <><div className="w-5 h-5 rounded-full bg-primary-bg flex items-center justify-center text-[10px] font-bold text-primary">{assignee.name?.charAt(0).toUpperCase()}</div> <span className="font-semibold text-xs">{assignee.name}</span></>
                  ) : (
                    <span className="text-xs text-textColor-muted">Unassigned</span>
                  )}
                </div>
                {showAssignDropdown && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-10 py-1">
                    <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs" onClick={() => { assignTask(task.id, null); setShowAssignDropdown(false); }}>Unassigned</div>
                    {members.map(m => (
                      <div key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { assignTask(task.id, m.id); setShowAssignDropdown(false); }}>
                        <div className="w-5 h-5 rounded-full bg-primary-bg flex items-center justify-center text-[10px] font-bold text-primary">{m.name?.charAt(0).toUpperCase()}</div>
                        <span className="text-xs font-semibold">{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 text-sm items-center">
            <div className="col-span-4 text-textColor-muted font-medium">Due date</div>
            <div className="col-span-8 w-full">
               <input type="date" value={task.deadline || ''} onChange={(e) => updateTask(task.id, {deadline: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 text-sm items-center">
            <div className="col-span-4 text-textColor-muted font-medium">Status</div>
            <div className="col-span-8 w-full">
              <select value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50">
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 text-sm items-center">
            <div className="col-span-4 text-textColor-muted font-medium">Priority</div>
            <div className="col-span-8 w-full">
              <select value={task.priority} onChange={(e) => updateTask(task.id, {priority: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 flex-shrink-0">
           <h3 className="text-sm font-bold text-textColor-main mb-2 flex items-center gap-2"><AlignLeft size={16}/> Description</h3>
           <textarea 
             value={task.description}
             onChange={(e) => updateTask(task.id, {description: e.target.value})}
             placeholder="Add a more detailed description..."
             className="w-full min-h-[100px] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary bg-slate-50 hover:bg-white transition-colors"
           />
        </div>

        {/* Discussion Content */}
        <div className="flex flex-col flex-1 pb-10">
            <h3 className="text-sm font-bold text-textColor-main mb-4 flex items-center gap-2"><MessageSquare size={16}/> Comments</h3>
            
            <div className="bg-background border border-slate-200 rounded-xl p-3 mb-6 focus-within:border-primary/50 transition-colors">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-transparent resize-none text-sm focus:outline-none text-textColor-main placeholder-textColor-muted min-h-[60px]"
                placeholder="Write a comment..."
              />
              <div className="flex justify-end items-center mt-2 border-t border-slate-200 pt-2">
                <button onClick={handlePostComment} className="bg-textColor-main text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black">Save</button>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="space-y-4">
              {task.comments && task.comments.map(c => {
                 const author = members.find(m => m.id === c.user);
                 return (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-bg border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(author?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-lg rounded-tl-none">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-textColor-main">{author?.name}</span>
                          <span className="text-[10px] text-textColor-muted">{new Date(c.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-textColor-muted leading-relaxed">
                          {c.text}
                        </p>
                    </div>
                  </div>
                 );
              })}
            </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task?.title}"? This cannot be undone.`}
      />
    </div>
  );
};

const Column = ({ title, columnId, tasks, onAddTask, onTaskClick }) => {
  return (
    <div className="flex flex-col w-[320px] min-h-[500px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-4 rounded-full ${columnId === 'todo' ? 'bg-slate-300' : columnId === 'inProgress' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
          <h3 className="font-bold text-textColor-main">{title}</h3>
          <span className="bg-slate-200 text-textColor-muted text-xs px-2 py-0.5 rounded shadow-inner font-semibold ml-1">{tasks.length}</span>
        </div>
        <button className="text-textColor-muted hover:text-textColor-main p-1 hover:bg-slate-200 rounded transition-colors" onClick={onAddTask}><Plus size={16} /></button>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 space-y-4 overflow-y-auto px-2 pb-4 pt-1 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100/50 rounded-xl border border-slate-200 border-dashed' : ''}`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onTaskClick && onTaskClick(task)}
                    className={`card p-4 group cursor-pointer ${snapshot.isDragging ? 'shadow-xl scale-105 rotate-1 border-primary/30 z-50' : 'card-hover'}`}
                    style={{ ...provided.draggableProps.style }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                        task.priority === 'High' ? 'text-badge-high-text bg-badge-high-bg' : 
                        task.priority === 'Medium' ? 'text-badge-medium-text bg-badge-medium-bg' : 
                        'text-badge-low-text bg-badge-low-bg'
                      }`}>
                        {task.priority || 'Low'}
                      </span>
                    </div>

                    <h4 className="font-bold text-textColor-main text-sm mb-1 leading-snug group-hover:text-primary transition-colors">{task.title}</h4>
                    {task.description && <p className="text-xs text-textColor-muted mb-4 line-clamp-2">{task.description}</p>}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
                      <div className="flex -space-x-1.5">
                        <AssigneeAvatar assigneeId={task.assigneeId} />
                      </div>
                      <div className="flex items-center gap-3 text-textColor-muted">
                        {task.deadline && (() => {
                          const { cls, label } = getDeadlineStyle(task.deadline, task.status);
                          return (
                            <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${cls}`}>
                              <Calendar size={12} />
                              {label ? label : new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                            </div>
                          );
                        })()}
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <MessageSquare size={14} /> {task.comments?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            <button 
              onClick={onAddTask}
              className="w-full py-2.5 mt-2 bg-surface text-textColor-muted font-semibold text-sm rounded-xl border-2 border-slate-200 border-dashed hover:border-primary/40 hover:text-primary hover:bg-primary-bg/30 transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus size={16} /> Add new
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
};

const KanbanBoard = ({ projectId, onBack }) => {
  const { projects, tasks, updateTaskStatus, addTask } = useProjectData();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const project = projects.find(p => p.id === projectId);
  
  if (!project) return <div className="p-8">Project not found.</div>;

  const projectTasks = tasks.filter(t => t.projectId === projectId);

  const columns = {
    todo: { id: 'todo', title: 'To Do' },
    inProgress: { id: 'inProgress', title: 'In Progress' },
    done: { id: 'done', title: 'Completed' }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    updateTaskStatus(draggableId, destination.droppableId);
  };

  return (
    <div className="h-[calc(100vh)] flex flex-col bg-background">
      <div className="px-8 py-6 border-b border-slate-200 bg-surface flex items-center gap-4 flex-shrink-0">
         <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-textColor-muted transition-colors border border-slate-200"><ArrowLeft size={16} /></button>
         <div>
            <h1 className="text-2xl font-bold text-textColor-main">{project.title}</h1>
            <p className="text-sm text-textColor-muted">{project.description}</p>
         </div>
         <div className="ml-auto text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">{project.status}</div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full flex gap-6 pb-2 min-w-max pr-6 items-start">
            {Object.values(columns).map(col => (
              <Column 
                key={col.id}
                columnId={col.id} 
                title={col.title} 
                tasks={projectTasks.filter(t => t.status === col.id)} 
                onAddTask={() => setIsTaskModalOpen(true)}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <AnimatePresence>
        <TaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          onAdd={addTask}
          projectId={projectId}
        />
      </AnimatePresence>

      <TaskDetailModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
};

export default KanbanBoard;
