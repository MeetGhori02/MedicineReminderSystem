import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Pill, Bell, Shield } from 'lucide-react';
import { MedicalBackground } from '../components/ui/MedicalBackground';

const features = [
  { icon: <Pill size={15} />, label: 'Smart medicine tracking' },
  { icon: <Bell size={15} />, label: 'Browser notifications' },
  { icon: <Activity size={15} />, label: 'Adherence analytics' },
  { icon: <Shield size={15} />, label: 'Secure & private' },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <MedicalBackground />

      <div className="hidden lg:flex lg:w-[52%] flex-col justify-center p-16 relative z-10">
        <div className="flex items-center gap-4 mb-16">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--emerald) 100%)' }}
          >
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
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="stagger-1 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid rgba(16,185,129,0.12)',
                color: 'var(--text-muted)',
                animationDelay: `${index * 0.08}s`,
              }}
            >
              <span style={{ color: 'var(--teal)' }}>{feature.icon}</span>
              <span className="text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--emerald) 100%)' }}
            >
              <Activity size={22} style={{ color: 'var(--bg-deep)' }} />
            </div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>MediRemind</h1>
          </div>

          <div
            className="modal-panel"
            style={{
              background: 'rgba(31,37,43,0.92)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 20,
              padding: 32,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(16,185,129,0.08)',
            }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--emerald)' }}>Welcome</span>
              </div>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Manage medicines with ease</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Choose an option to continue</p>
            </div>

            <div className="space-y-3">
              <Link to="/login" className="btn-primary justify-center py-3" style={{ width: '100%' }}>
                <span>Login</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/register"
                className="btn-secondary justify-center py-3"
                style={{ width: '100%', borderColor: 'rgba(16,185,129,0.2)', color: 'var(--text-primary)' }}
              >
                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
