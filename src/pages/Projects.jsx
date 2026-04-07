import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { Plus, MoreVertical, FolderOpen, Calendar, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectModal = ({ isOpen, onClose, project = null }) => {
  const { addProject, updateProject, members } = useProjectData();
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [deadline, setDeadline] = useState(project?.deadline || '');
  const [status, setStatus] = useState(project?.status || 'Active');
  const [selectedTeam, setSelectedTeam] = useState(project?.team || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (project) {
      updateProject(project.id, { title, description, deadline, status, team: selectedTeam });
    } else {
      addProject({ title, description, deadline, status, team: selectedTeam });
    }
    onClose();
  };

  const toggleMember = (id) => {
    setSelectedTeam(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
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
        <h3 className="text-xl font-bold text-textColor-main mb-6">{project ? 'Edit Project' : 'Create New Project'}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Project Name"
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div>
             <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Description</label>
             <textarea 
               value={description}
               onChange={e => setDescription(e.target.value)}
               className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 h-20 resize-none focus:outline-none focus:border-primary/50 transition-all font-medium"
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Deadline</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary/50 transition-all font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary/50 transition-all font-medium">
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
             <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-2 block border-t border-slate-100 pt-4 mt-2">Assign Team</label>
             <div className="flex flex-wrap gap-2">
               {members.map(m => (
                 <div key={m.id} onClick={() => toggleMember(m.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer border text-xs font-semibold transition-all ${selectedTeam.includes(m.id) ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 border-slate-200 text-textColor-muted hover:border-slate-300'}`}>
                   <img src={m.avatar} alt="avatar" className="w-4 h-4 rounded-full" />
                   {m.name}
                 </div>
               ))}
             </div>
          </div>
          
          <button type="submit" className="w-full btn-primary font-bold py-3 mt-4">Save Project</button>
        </form>
      </motion.div>
    </div>
  );
};

const Projects = ({ onOpenProject }) => {
  const { projects, deleteProject, tasks, members } = useProjectData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const openEdit = (p) => {
    setEditingProject(p);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  return (
    <div className="p-8 animate-in space-y-6">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <FolderOpen size={24} className="text-primary" /> Projects Area
          </h1>
          <p className="text-textColor-muted">Manage your workspaces and deadlines.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 font-bold px-6 py-2.5 shadow-md shadow-primary/20">
          <Plus size={18} /> Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((p, i) => {
           const pTasks = tasks.filter(t => t.projectId === p.id);
           const completed = pTasks.filter(t => t.status === 'done').length;
           const progress = pTasks.length ? Math.floor((completed / pTasks.length) * 100) : 0;
           return (
             <div key={i} className="card p-6 card-hover shadow-sm border border-slate-200">
               <div className="flex justify-between items-start mb-4">
                 <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide
                    ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                 `}>{p.status}</div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-textColor-muted hover:text-primary hover:bg-slate-100 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteProject(p.id)} className="p-1.5 text-textColor-muted hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"><Trash2 size={16} /></button>
                 </div>
               </div>
               
               <h3 className="text-lg font-bold text-textColor-main mb-1 cursor-pointer hover:text-primary transition-colors" onClick={() => onOpenProject(p.id)}>{p.title}</h3>
               <p className="text-sm text-textColor-muted mb-6 line-clamp-2 min-h-[40px]">{p.description}</p>
               
               <div className="flex items-center gap-2 text-xs font-semibold text-textColor-muted mb-6 bg-slate-50 p-2 rounded">
                 <Calendar size={14} className="text-textColor-light" />
                 Deadline: <span className="text-textColor-main">{p.deadline || 'Not set'}</span>
               </div>

               <div className="flex justify-between items-end">
                 <div>
                    <div className="text-[10px] font-bold text-textColor-muted uppercase tracking-widest mb-1.5">Progress</div>
                    <div className="flex items-center gap-3 w-40">
                      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{width: `${progress}%`}}></div>
                      </div>
                      <span className="text-xs font-bold text-textColor-main">{progress}%</span>
                    </div>
                 </div>
                 <div className="flex -space-x-2">
                    {p.team.map((tid, idx) => {
                      const member = members.find(m => m.id === tid);
                      if (!member) return null;
                      return <img key={idx} src={member.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm bg-slate-200" title={member.name} />
                    })}
                 </div>
               </div>
             </div>
           );
        })}
      </div>

      <AnimatePresence>
        <ProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} project={editingProject} />
      </AnimatePresence>
    </div>
  );
};

export default Projects;
