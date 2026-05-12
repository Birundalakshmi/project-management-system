import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card w-full max-w-sm p-6 border border-slate-200 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-textColor-muted hover:text-textColor-main">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-rose-50 rounded-xl">
            <AlertTriangle size={20} className="text-rose-500" />
          </div>
          <h3 className="text-base font-bold text-textColor-main">{title}</h3>
        </div>
        <p className="text-sm text-textColor-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary font-bold py-2.5 text-sm">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmDialog;
