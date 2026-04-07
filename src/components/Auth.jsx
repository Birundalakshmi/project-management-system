import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Github, Chrome, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useProjectData } from '../lib/ProjectContext';

const Auth = ({ onAuthSuccess }) => {
  const { setActiveUser, members } = useProjectData();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      } else {
        if (!name.trim()) {
           setError('Please enter your full name.');
           setLoading(false);
           return;
        }
        const { error } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password,
          options: {
            data: {
              full_name: name.trim(),
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dot-pattern relative overflow-hidden px-4">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-slate-200 rounded-3xl p-10 shadow-xl space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-primary/10 overflow-hidden bg-primary-bg text-primary border border-primary/20">
              <Hexagon size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-textColor-main leading-tight">
              {isLogin ? 'Welcome back to Nexus' : 'Create your Nexus account'}
            </h1>
            <p className="text-textColor-muted text-sm">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Start managing your projects like a pro today'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-textColor-light" size={18} />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-background border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textColor-light" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-background border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-textColor-muted uppercase tracking-widest">Password</label>
                {isLogin && <button type="button" className="text-xs text-primary font-semibold hover:underline">Forgot password?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textColor-light" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-textColor-main focus:outline-none focus:border-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>



          <div className="text-center pt-2">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-textColor-muted text-sm hover:text-textColor-main transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-primary font-bold hover:underline">{isLogin ? 'Create Account' : 'Sign In'}</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-textColor-muted">
          By continuing, you agree to our <span className="text-slate-600 font-semibold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-slate-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
