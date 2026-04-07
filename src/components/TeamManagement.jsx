import React, { useState } from 'react';
import { UserPlus, Shield, Search, Trash2, Edit2, ShieldCheck, X, CheckSquare } from 'lucide-react';
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
          <img src={member.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-slate-200" />
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
                    <p className="text-xs text-textColor-muted mt-1">{project?.title || 'Unknown Project'} - Deadline: {t.deadline || 'N/A'}</p>
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

const MemberCard = ({ member, onRemove, onEditRole, onViewTasks }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="card flex items-center justify-between p-4 card-hover border border-slate-200"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full border border-slate-200 shrink-0">
        <img 
          src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
          alt={member.name} 
          className="w-full h-full rounded-full bg-slate-100 object-cover"
        />
      </div>
      <div>
        <h4 className="font-bold text-textColor-main group-hover:text-primary transition-colors">{member.name}</h4>
        <p className="text-xs text-textColor-muted">{member.email}</p>
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end">
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          member.role === 'Admin' ? 'bg-primary/10 text-primary border border-primary/20' : 
          member.role === 'Manager' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
          'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {member.role === 'Admin' ? <ShieldCheck size={12} /> : member.role === 'Manager' ? <Shield size={12} /> : <UserPlus size={12} />}
          {member.role}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => onViewTasks(member)}
          className="p-2 rounded-lg hover:bg-slate-100 text-textColor-muted hover:text-primary transition-all"
          title="View Tasks"
        >
          <CheckSquare size={16} />
        </button>
        <button 
          onClick={() => onEditRole(member.id)}
          className="p-2 rounded-lg hover:bg-slate-100 text-textColor-muted hover:text-textColor-main transition-all"
          title="Toggle Role"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onRemove(member.id)}
          className="p-2 rounded-lg hover:bg-rose-50 text-textColor-muted hover:text-rose-500 transition-all"
          title="Remove Member"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const InviteModal = ({ isOpen, onClose, onInvite }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onInvite({
      name,
      email,
      role
    });
    setName('');
    setEmail('');
    onClose();
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
        <button onClick={onClose} className="absolute top-4 right-4 text-textColor-muted hover:text-textColor-main">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-textColor-main mb-6">Invite Member</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-1 block">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
            >
              <option value="Member">Member</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full btn-primary font-bold py-3 mt-4 text-sm">Send Invite</button>
        </form>
      </motion.div>
    </div>
  );
};

const TeamManagement = () => {
  const { members, addMember, removeMember, updateMemberRole } = useProjectData();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [viewTasksMember, setViewTasksMember] = useState(null);

  const toggleRole = (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const roles = ['Member', 'Manager', 'Admin'];
    const nextRole = roles[(roles.indexOf(member.role) + 1) % roles.length];
    updateMemberRole(id, nextRole);
  };

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 animate-in space-y-6 flex flex-col h-full max-h-screen">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-textColor-main">Team Members</h2>
          <p className="text-textColor-muted mt-1">Manage team roles and task assignments.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="btn-primary flex items-center gap-2 font-bold px-6 py-2.5 shadow-lg shadow-primary/25"
        >
          <UserPlus size={18} />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="card flex-1 flex flex-col !p-0 overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search size={18} className="text-textColor-light" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..." 
            className="bg-transparent border-none focus:outline-none text-sm text-textColor-main w-full placeholder:text-textColor-light font-medium"
          />
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto pr-4 scrollbar-hide">
          <AnimatePresence>
            {filteredMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onRemove={removeMember}
                onEditRole={toggleRole} 
                onViewTasks={setViewTasksMember}
              />
            ))}
            {filteredMembers.length === 0 && (
              <div className="text-center text-textColor-muted py-8">No members found matching your search.</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        <InviteModal 
          isOpen={isInviteOpen} 
          onClose={() => setIsInviteOpen(false)} 
          onInvite={addMember}
        />
        <MemberTasksModal 
          isOpen={!!viewTasksMember} 
          onClose={() => setViewTasksMember(null)} 
          member={viewTasksMember} 
        />
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;
