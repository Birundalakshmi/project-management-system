import React, { useState } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { User, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProfileSettings = () => {
  const { activeUser, setActiveUser } = useProjectData();
  const [name, setName] = useState(activeUser?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!activeUser || !name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', activeUser.id);
    if (!error) setActiveUser({ ...activeUser, name: name.trim() });
    setSaving(false);
  };

  return (
    <div className="p-8 animate-in space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <User size={24} className="text-primary" /> Profile Settings
          </h2>
          <p className="text-textColor-muted mt-1">Update your display name.</p>
        </div>
      </div>

      <div className="card p-8 border border-slate-200 space-y-6">
        <div>
          <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-2 block">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-background border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-primary/50 transition-all font-medium"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-2 block">Email</label>
          <input
            type="email"
            value={activeUser?.email || ''}
            disabled
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-textColor-muted font-medium cursor-not-allowed"
          />
          <p className="text-xs text-textColor-muted mt-2">Email cannot be changed</p>
        </div>

        <div>
          <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest mb-2 block">Role</label>
          <input
            type="text"
            value={activeUser?.role || ''}
            disabled
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-textColor-muted font-medium cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="w-full btn-primary font-bold py-3 flex items-center justify-center gap-2"
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            : <><Save size={18} /> Save Changes</>
          }
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
