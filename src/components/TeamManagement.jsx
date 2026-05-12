import React, { useState } from 'react';
import { UserPlus, Shield, Search, Trash2, Edit2, ShieldCheck, X, CheckSquare, Mail, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectData } from '../lib/ProjectContext';

const MemberTasksModal = ({ isOpen, onClose, member }) => {
  const { tasks, projects } = useProjectData();
  if (!isOpen || !member) return null;
  const memberTasks = tasks.filter(t => t.assigneeId === member.id);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-2xl p-6 relative border border-slate-200"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-textColor-muted hover:text-textColor-main">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full border border-slate-200 bg-primary-bg flex items-center justify-center text-primary font-bold shrink-0">
            {member.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-textColor-main">{member.name}'s Tasks</h3>
            <p className="text-sm text-textColor-muted">{memberTasks.length} Assigned Tasks</p>
          </div>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {memberTasks.length === 0 ? (
            <div className="text-center py-8 text-textColor-muted bg-slate-50 rounded-xl">No tasks assigned yet.</div>
          ) : (
            memberTasks.map(t => {
              const project = projects.find(p => p.id === t.projectId);
              return (
                <div key={t.id} className="flex items-center justify-between p-4 bg-background border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="font-bold text-textColor-main">{t.title}</h4>
                    <p className="text-xs text-textColor-muted mt-1">{project?.title || 'Unknown Project'} · Deadline: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

const AddMemberModal = ({ isOpen, onClose }) => {
  const { projects, addMember } = useProjectData();
  const [email, setEmail] = useState('');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !selectedProject) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await addMember(email.trim(), selectedProject);

    if (result?.error) {
      setError(result.error);
    } else {
      const project = projects.find(p => p.id === selectedProject);
      setSuccess(`${result.member.name} has been added to "${project?.title}" and notified.`);
      setEmail('');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-md border border-slate-200 p-6 relative"
      >
        <button onClick={() => { onClose(); setError(''); setSuccess(''); setEmail(''); }} className="absolute top-4 right-4 text-textColor-muted hover:text-textColor-main">
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary-bg rounded-xl">
            <UserPlus size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-textColor-main">Add Team Member</h3>
            <p className="text-xs text-textColor-muted">They must already have an account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Project</label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-textColor-light" size={16} />
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="w-full bg-background border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Member Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textColor-light" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
                placeholder="member@example.com"
                className="w-full bg-background border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                ✓ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !email.trim() || !selectedProject}
            className="w-full btn-primary font-bold py-3 mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <><UserPlus size={16} /> Add to Project</>
            }
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const MemberCard = ({ member, onRemove, onEditRole, onViewTasks, projects }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="card flex items-center justify-between p-4 card-hover border border-slate-200"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full border border-slate-200 bg-primary-bg flex items-center justify-center text-primary font-bold text-sm shrink-0">
        {member.name?.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 className="font-bold text-textColor-main">{member.name}</h4>
        <p className="text-xs text-textColor-muted">{member.email}</p>
        {/* Show which projects this member belongs to */}
        <div className="flex flex-wrap gap-1 mt-1">
          {projects.filter(p => p.team?.includes(member.id)).map(p => (
            <span key={p.id} className="text-[10px] font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">{p.title}</span>
          ))}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        member.role === 'Admin' ? 'bg-primary/10 text-primary border border-primary/20' :
        member.role === 'Manager' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
        'bg-slate-100 text-slate-600 border border-slate-200'
      }`}>
        {member.role === 'Admin' ? <ShieldCheck size={12} /> : member.role === 'Manager' ? <Shield size={12} /> : <UserPlus size={12} />}
        {member.role}
      </span>

      <div className="flex items-center gap-2">
        <button onClick={() => onViewTasks(member)} className="p-2 rounded-lg hover:bg-slate-100 text-textColor-muted hover:text-primary transition-all" title="View Tasks">
          <CheckSquare size={16} />
        </button>
        <button onClick={() => onEditRole(member.id)} className="p-2 rounded-lg hover:bg-slate-100 text-textColor-muted hover:text-textColor-main transition-all" title="Toggle Role">
          <Edit2 size={16} />
        </button>
        <button onClick={() => onRemove(member.id)} className="p-2 rounded-lg hover:bg-rose-50 text-textColor-muted hover:text-rose-500 transition-all" title="Remove Member">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const TeamManagement = () => {
  const { members, removeMember, updateMemberRole, projects, activeUser } = useProjectData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [viewTasksMember, setViewTasksMember] = useState(null);

  const toggleRole = (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const roles = ['Member', 'Manager', 'Admin'];
    const nextRole = roles[(roles.indexOf(member.role) + 1) % roles.length];
    updateMemberRole(id, nextRole);
  };

  // Show all members who are part of at least one visible project (excluding self)
  const teamMembers = members.filter(m =>
    m.id !== activeUser?.id &&
    projects.some(p => p.team?.includes(m.id))
  );

  const filteredMembers = teamMembers.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-in space-y-6 flex flex-col h-full max-h-screen">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-textColor-main">Team Members</h2>
          <p className="text-textColor-muted mt-1">Add members by email — they'll be notified and get access instantly.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-primary flex items-center gap-2 font-bold px-6 py-2.5 shadow-lg shadow-primary/25"
        >
          <UserPlus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="card flex-1 flex flex-col !p-0 overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search size={18} className="text-textColor-light" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent border-none focus:outline-none text-sm text-textColor-main w-full placeholder:text-textColor-light font-medium"
          />
          <span className="text-xs font-bold text-textColor-muted bg-slate-200 px-2 py-1 rounded-full shrink-0">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto pr-4 scrollbar-hide">
          <AnimatePresence>
            {filteredMembers.length === 0 ? (
              <div className="text-center text-textColor-muted py-16 space-y-2">
                <UserPlus size={40} className="mx-auto opacity-20" />
                <p className="font-semibold">No team members yet</p>
                <p className="text-sm">Click "Add Member" to add someone by their email address.</p>
              </div>
            ) : (
              filteredMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  projects={projects}
                  onRemove={removeMember}
                  onEditRole={toggleRole}
                  onViewTasks={setViewTasksMember}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isAddOpen && <AddMemberModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />}
        {viewTasksMember && (
          <MemberTasksModal
            isOpen={!!viewTasksMember}
            onClose={() => setViewTasksMember(null)}
            member={viewTasksMember}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;
