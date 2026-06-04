import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Pill, LogOut, Menu, X, Bell, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Medicines',  path: '/medicines',  icon: <Pill size={18} /> },
];

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const blink = time.getSeconds() % 2 === 0;
  return (
    <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg font-display text-sm font-bold tracking-widest"
      style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--teal)', border: '1px solid rgba(16,185,129,0.15)' }}>
      {hh}
      <span style={{ opacity: blink ? 1 : 0.3, transition: 'opacity 0.1s' }}>:</span>
      {mm}
      <span style={{ opacity: 0.5, fontSize: 11 }}>:{ss}</span>
    </div>
  );
};

export const Layout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleBellClick = async () => {
    if (!("Notification" in window)) {
      toast.error('Browser notifications are not supported on this device.');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('MediRemind notifications are active', {
        body: 'You will receive medicine reminder alerts.',
      });
      toast.success('Notifications are already enabled.');
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked. Enable them in browser site settings.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('MediRemind notifications enabled', {
        body: 'You will now get reminder alerts.',
      });
      toast.success('Notifications enabled successfully.');
    } else {
      toast.error('Notification permission not granted.');
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(16,185,129,0.12)' }}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center pulse-ring"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, var(--emerald) 100%)' }}>
            <Activity size={20} style={{ color: 'var(--bg-deep)' }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>MediRemind</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Clinical Assistant</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
              className="slide-in-left block" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'linear-gradient(90deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.02) 100%)' : 'transparent',
                  borderLeft: active ? '2px solid var(--teal)' : '2px solid transparent',
                  color: active ? 'var(--teal)' : 'var(--text-muted)',
                  marginLeft: -1,
                }}>
                <span>{item.icon}</span>
                {item.label}
                {active && (
                  <div className="ml-auto w-2 h-2 rounded-full glow-pulse"
                    style={{ background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)' }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status widget */}
      <div className="mx-4 mb-4 p-4 rounded-xl"
        style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--emerald)' }}>System Online</span>
        </div>
        <svg viewBox="0 0 100 20" width="100%" height={20} style={{ display: 'block' }}>
          <polyline points="0,10 15,10 20,3 26,17 30,5 35,15 38,10 100,10"
            fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"
            style={{ strokeDasharray: 150, strokeDashoffset: 150, animation: 'ecgDraw 2s linear infinite' }} />
        </svg>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Reminders active</p>
      </div>

      {/* User */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(16,185,129,0.12)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--teal-dim) 0%, var(--emerald-dim) 100%)', color: 'var(--bg-deep)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ color: '#ff4d6d' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,109,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-deep)' }}>
      {open && (
        <div className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(17,24,39,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--bg-mid)', borderRight: '1px solid rgba(16,185,129,0.1)' }}>
        <Sidebar />
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 lg:px-8"
          style={{ background: 'rgba(23,27,31,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(16,185,129,0.12)' }}>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h2 className="hidden lg:block font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {navItems.find(n => n.path === location.pathname)?.label || 'MediRemind'}
          </h2>

          <div className="flex items-center gap-2 ml-auto">
            <LiveClock />
            <button className="p-2.5 rounded-xl relative transition-all"
              onClick={handleBellClick}
              aria-label="Notification settings"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)' }} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 page-enter">{children}</main>
      </div>
    </div>
  );
};
