import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MedicalBackground } from '../components/ui/MedicalBackground';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Min 6 characters for password'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created — welcome aboard!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  const strength = form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Medium' : form.password.length > 0 ? 'Weak' : '';
  const strengthColor = strength === 'Strong' ? 'var(--emerald)' : strength === 'Medium' ? '#ffb347' : '#ff4d6d';
  const strengthW = strength === 'Strong' ? '100%' : strength === 'Medium' ? '60%' : strength === 'Weak' ? '25%' : '0%';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: 'var(--bg-deep)' }}>
      <MedicalBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--emerald) 100%)' }}>
            <Activity size={22} style={{ color: 'var(--bg-deep)' }} />
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>MediRemind</h1>
        </div>

        <div className="modal-panel" style={{
          background: 'rgba(31,37,43,0.92)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(16,185,129,0.1)',
        }}>
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--teal)' }}>New Registration</span>
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start your medicine tracking journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
                <input type="text" className="input-field" style={{ paddingLeft: 40 }}
                  placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
                <input type="email" className="input-field" style={{ paddingLeft: 40 }}
                  placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 40 }} placeholder="Min 6 characters"
                  value={form.password} onChange={e => update('password', e.target.value)} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute top-1/2 -translate-y-1/2" style={{ right: 14, color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: strengthW, background: strengthColor }} />
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: strengthColor }}>{strength}</p>
                </div>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
                <input type="password" className="input-field" style={{ paddingLeft: 40 }}
                  placeholder="Repeat password" value={form.confirm} onChange={e => update('confirm', e.target.value)} />
                {form.confirm.length > 0 && (
                  <span className="absolute top-1/2 -translate-y-1/2 text-sm" style={{ right: 14 }}>
                    {form.password === form.confirm ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary justify-center py-3 mt-2"
              style={{ width: '100%' }}>
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 spin-glow"
                    style={{ borderColor: 'var(--bg-deep)', borderTopColor: 'transparent' }} />
                : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(16,185,129,0.12)' }}>
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--teal)' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
