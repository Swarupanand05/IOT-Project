import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserRole } from '../../types';
import { Activity, Lock, Mail, User, Shield, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, setUser, user } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // Local Fallback Login when Supabase is not connected
      setTimeout(() => {
        setUser({
          id: `usr-${Date.now()}`,
          user_id: 'local-demo-uuid',
          full_name: fullName || (email.split('@')[0] ? email.split('@')[0] : 'Demo User'),
          email: email || 'operator@predictguard.ai',
          role: role,
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        setAuthModalOpen(false);
      }, 600);
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          // Fetch profile role
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          setUser({
            id: profile?.id || data.user.id,
            user_id: data.user.id,
            full_name: profile?.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: profile?.role || 'operator',
            created_at: data.user.created_at,
          });
          setAuthModalOpen(false);
        }
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;

        if (data.user) {
          // Create profile record
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            full_name: fullName,
            email,
            role,
          });
          setSuccessMsg('Account created successfully! You can now log in.');
          setMode('login');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (selectedRole: UserRole) => {
    setUser({
      id: `usr-${Date.now()}`,
      user_id: 'guest-uuid',
      full_name: selectedRole === 'admin' ? 'Dr. Vance (Admin)' : selectedRole === 'operator' ? 'Alex (Operator)' : 'Guest Inspector',
      email: `${selectedRole}@predictguard.ai`,
      role: selectedRole,
      created_at: new Date().toISOString(),
    });
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-hover"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 mx-auto mb-3 shadow-glow-cyan">
            <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-mono">PredictGuard AI Auth</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Supabase Row-Level Security Authentication</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Live Supabase environment not set.</span> Quick demo authorization is enabled below.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Eng. Sarah Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="operator@predictguard.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-200 border border-surface-border rounded-lg pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-200 border border-surface-border rounded-lg pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 mb-1">User Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'operator', 'viewer'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg border text-center capitalize font-semibold transition-all ${
                      role === r
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-surface-200 border-surface-border text-slate-400 hover:bg-surface-hover'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:brightness-110 transition-all shadow-glow-cyan"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </button>
        </form>

        {/* Guest Role Fast Access */}
        <div className="mt-6 pt-4 border-t border-surface-border text-center">
          <p className="text-[11px] font-mono text-slate-400 mb-2">Fast Access Demo Roles:</p>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <button
              onClick={() => handleGuestLogin('admin')}
              className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md"
            >
              Admin Role
            </button>
            <button
              onClick={() => handleGuestLogin('operator')}
              className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md"
            >
              Operator Role
            </button>
            <button
              onClick={() => handleGuestLogin('viewer')}
              className="py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md"
            >
              Viewer Role
            </button>
          </div>
        </div>

        {/* Switch mode links */}
        <div className="mt-4 flex justify-between text-[11px] font-mono text-slate-400">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('signup')} className="hover:text-cyan-400">
                Create new account
              </button>
              <button onClick={() => setMode('forgot')} className="hover:text-cyan-400">
                Forgot password?
              </button>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="hover:text-cyan-400 mx-auto">
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
