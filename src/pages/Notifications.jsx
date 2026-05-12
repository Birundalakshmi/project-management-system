import React, { useEffect } from 'react';
import { useProjectData } from '../lib/ProjectContext';
import { Bell, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const { notifications, markNotificationsRead } = useProjectData();

  useEffect(() => {
    const timer = setTimeout(() => {
      markNotificationsRead();
    }, 2000);
    return () => clearTimeout(timer);
  }, [markNotificationsRead]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
  };

  return (
    <div className="p-8 animate-in space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-textColor-main flex items-center gap-2">
            <Bell size={24} className="text-primary" /> Notifications
          </h1>
          <p className="text-textColor-muted">Stay updated with your latest alerts.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center p-12 bg-surface rounded-2xl border border-slate-200 text-textColor-muted">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">You're all caught up!</p>
            <p className="text-sm">No new notifications.</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                n.read ? 'bg-background border-slate-200' : 'bg-primary-bg/20 border-primary/20 shadow-sm'
              }`}
            >
              <div className={`mt-1 p-2 rounded-full ${n.read ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white'}`}>
                {n.message.includes('completed') ? <Check size={16} /> : <Bell size={16} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${n.read ? 'text-textColor-muted' : 'text-textColor-main font-semibold'}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-textColor-light mt-2">
                  <Clock size={10} /> {formatDate(n.date)}
                </div>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-3"></div>}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
