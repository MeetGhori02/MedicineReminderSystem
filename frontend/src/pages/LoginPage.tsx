import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, Pill, Bell, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MedicalBackground } from '../components/ui/MedicalBackground';
import toast from 'react-hot-toast';

const features = [
  { icon: <Pill size={15} />, label: 'Smart medicine tracking' },
  { icon: <Bell size={15} />, label: 'Browser notifications' },
  { icon: <Activity size={15} />, label: 'Adherence analytics' },
  { icon: <Shield size={15} />, label: 'Secure & private' },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Access granted — welcome back');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <MedicalBackground />

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-center p-16 relative z-10">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--emerald) 100%)' }}>
            <Activity size={28} style={{ color: 'var(--bg-deep)' }} />
            <div className="absolute inset-0 rounded-2xl pulse-ring" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>MediRemind</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Clinical Intelligence Platform</p>
          </div>
        </div>

        <h2 className="font-display text-5xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
          Your health,
          <br />
          <span style={{ color: 'var(--teal)', textShadow: '0 0 30px rgba(16,185,129,0.5)' }}>precisely</span>
          <br />
          scheduled.
        </h2>

        <p className="text-lg mb-12" style={{ color: 'var(--text-muted)', maxWidth: 360 }}>
          Never miss a dose. Smart reminders, real-time tracking, and beautiful analytics.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={f.label} className="stagger-1 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)',
                color: 'var(--text-muted)', animationDelay: `${i * 0.08}s`,
              }}>
              <span style={{ color: 'var(--teal)' }}>{f.icon}</span>
              <span className="text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--emerald) 100%)' }}>
              <Activity size={22} style={{ color: 'var(--bg-deep)' }} />
            </div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>MediRemind</h1>
          </div>

          <div className="modal-panel" style={{
            background: 'rgba(31,37,43,0.92)', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(16,185,129,0.08)',
          }}>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--emerald)' }}>Secure Access</span>
              </div>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Sign in to your account</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
                  <input type="email" className="input-field" style={{ paddingLeft: 40 }}
                    placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
                  <input type={showPwd ? 'text' : 'password'} className="input-field"
                    style={{ paddingLeft: 40, paddingRight: 40 }} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute top-1/2 -translate-y-1/2" style={{ right: 14, color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary justify-center py-3 mt-2"
                style={{ width: '100%' }}>
                {loading
                  ? <div className="w-5 h-5 rounded-full border-2 spin-glow"
                      style={{ borderColor: 'var(--bg-deep)', borderTopColor: 'transparent' }} />
                  : <><span>Sign In</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(16,185,129,0.12)' }}>
              <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold" style={{ color: 'var(--teal)' }}>Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
