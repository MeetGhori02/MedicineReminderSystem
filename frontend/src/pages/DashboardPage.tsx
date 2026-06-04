import { useEffect, useState, useCallback } from 'react';
import { Pill, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, ChevronRight, Activity } from 'lucide-react';
import { dashboardApi, medicineApi } from '../services/api';
import { DashboardSummary, Medicine } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useReminders } from '../hooks/useReminders';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { PulseLoader } from '../components/ui/PulseLoader';
import { MedicineReminderPopup } from '../components/ui/MedicineReminderPopup';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon, accent, sub, delay = 0,
}: {
  label: string; value: number; icon: React.ReactNode; accent: string; sub?: string; delay?: number;
}) => (
  <div className="card stagger-1" style={{ animationDelay: `${delay}s`, position: 'relative', overflow: 'hidden' }}>
    {/* Corner accent glow */}
    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
      style={{ background: accent, filter: 'blur(16px)' }} />
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative"
        style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-3xl font-bold font-display mt-0.5" style={{ color: 'var(--text-primary)' }}>
          <AnimatedCounter value={value} />
        </p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.5 }} />
  </div>
);

// ── Medicine row card ──────────────────────────────────────────────────────────
const TodayMedRow = ({
  med,
  onTaken,
  onOpen,
}: {
  med: Medicine;
  onTaken: (id: number, t: boolean) => void;
  onOpen: (id: number) => void;
}) => {
  const [hover, setHover] = useState(false);
  const now = new Date();
  const [hh, mm] = med.time.split(':').map(Number);
  const isPast = now.getHours() * 60 + now.getMinutes() > hh * 60 + mm;
  const status = med.taken ? 'taken' : isPast ? 'missed' : 'pending';
  const statusColor = { taken: 'var(--emerald)', missed: '#ff4d6d', pending: '#ffb347' }[status];
  const statusLabel = { taken: 'Taken', missed: 'Missed', pending: 'Pending' }[status];

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
      style={{
        background: hover ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.02)',
        border: `1px solid ${med.taken ? 'rgba(52,211,153,0.2)' : 'rgba(16,185,129,0.08)'}`,
        cursor: 'pointer',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${med.name}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(med.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(med.id);
        }
      }}
    >
      {/* Time bubble */}
      <div className="text-center min-w-[52px] px-2 py-1 rounded-lg"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
        <p className="text-sm font-bold font-display" style={{ color: 'var(--teal)' }}>{med.time}</p>
      </div>

      {/* Pill icon */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: med.taken ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.08)' }}>
        <Pill size={14} style={{ color: med.taken ? 'var(--emerald)' : 'var(--teal)' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', textDecoration: med.taken ? 'line-through' : 'none', opacity: med.taken ? 0.6 : 1 }}>
          {med.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {med.dosage}
          {med.mealTimings && med.mealTimings.length > 0 && (
            <> · <span style={{ color: '#9370db' }}>{med.mealTimings.map(mt => mt.replace('AFTER_', '').toLowerCase()).join(', ')}</span></>
          )}
        </p>
      </div>

      {/* Status */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
        {statusLabel}
      </div>

      {/* Check button */}
      <button onClick={(e) => { e.stopPropagation(); onTaken(med.id, !med.taken); }} title={med.taken ? 'Mark untaken' : 'Mark taken'}
        className="transition-all duration-200"
        style={{ color: med.taken ? 'var(--emerald)' : 'var(--text-muted)', padding: 6, borderRadius: 8 }}
        onMouseEnter={e => { if (!med.taken) e.currentTarget.style.color = 'var(--emerald)'; e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = med.taken ? 'var(--emerald)' : 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
        <CheckCircle2 size={20} className={med.taken ? 'check-pop' : ''} />
      </button>
    </div>
  );
};

// ── Adherence arc ──────────────────────────────────────────────────────────────
const AdherenceArc = ({ rate }: { rate: number }) => {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const color = rate >= 80 ? 'var(--emerald)' : rate >= 50 ? '#ffb347' : '#ff4d6d';
  const label = rate >= 80 ? 'Excellent' : rate >= 50 ? 'Fair' : 'Needs work';

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 120 120" width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth={10} />
          <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            <AnimatedCounter value={rate} suffix="%" />
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rate</span>
        </div>
      </div>
      <div>
        <p className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>Weekly Adherence</p>
        <p className="text-sm font-medium mb-2" style={{ color }}>
          {rate >= 80 ? '🌟' : rate >= 50 ? '⚡' : '⚠️'} {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: 140 }}>
          {rate >= 80 ? 'Keep up the great work!' : rate >= 50 ? 'A few missed doses this week' : 'Try to improve consistency'}
        </p>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderMedicine, setReminderMedicine] = useState<Medicine | null>(null);

  const handleReminderTriggered = useCallback((medicine: Medicine) => {
    setReminderMedicine(medicine);
    setReminderModalOpen(true);
  }, []);

  useReminders(summary?.today.medicines ?? [], {
    onReminderTriggered: handleReminderTriggered,
  });

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await dashboardApi.getSummary();
      if (data.success) setSummary(data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleMarkTaken = async (id: number, taken: boolean) => {
    try {
      await medicineApi.markTaken(id, taken);
      toast.success(taken ? '✅ Marked as taken' : 'Marked as not taken');
      fetchSummary();
    } catch { toast.error('Failed to update'); }
  };

  const handleTakeMedicineFromPopup = async (id: number) => {
    await handleMarkTaken(id, true);
  };

  const openMedicineDetails = (id: number) => {
    navigate(`/medicines?medicineId=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PulseLoader size="lg" />
      </div>
    );
  }

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="stagger-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full glow-pulse" style={{ background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {format(today, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {greeting},{' '}
          <span style={{ color: 'var(--teal)', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            {user?.name.split(' ')[0]}
          </span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {summary?.today.pending === 0
            ? "All doses complete for today! 🎉"
            : `You have ${summary?.today.pending} pending dose${(summary?.today.pending ?? 0) > 1 ? 's' : ''} today`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today Total" value={summary?.today.total ?? 0} icon={<Pill size={20} />} accent="var(--teal)" sub="scheduled" delay={0.05} />
        <StatCard label="Taken Today" value={summary?.today.taken ?? 0} icon={<CheckCircle2 size={20} />} accent="var(--emerald)" sub="completed" delay={0.12} />
        <StatCard label="Pending"     value={summary?.today.pending ?? 0} icon={<Clock size={20} />}       accent="#ffb347" sub="remaining" delay={0.19} />
        <StatCard label="Missed (7d)" value={summary?.week.missed ?? 0}   icon={<AlertCircle size={20} />}  accent="#ff4d6d" sub="last week"  delay={0.26} />
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's medicine list */}
        <div className="lg:col-span-2 card stagger-2" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Calendar size={15} style={{ color: 'var(--teal)' }} />
              </div>
              <h3 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Today's Medicines</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--teal)', border: '1px solid rgba(16,185,129,0.15)' }}>
              {summary?.today.total ?? 0} total
            </span>
          </div>

          {(summary?.today.medicines.length ?? 0) === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <Pill size={28} style={{ color: 'rgba(16,185,129,0.3)' }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>No medicines for today</p>
              <p className="text-sm" style={{ color: '#8b98a5' }}>Add medicines to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {summary?.today.medicines.map((med) => (
                <TodayMedRow key={med.id} med={med} onTaken={handleMarkTaken} onOpen={openMedicineDetails} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Adherence arc */}
          <div className="card stagger-3" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <TrendingUp size={15} style={{ color: 'var(--emerald)' }} />
              </div>
              <h3 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Adherence</h3>
            </div>
            <AdherenceArc rate={summary?.week.adherenceRate ?? 0} />

            {/* Week bar */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(16,185,129,0.08)' }}>
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span>Weekly progress</span>
                <span>{summary?.week.taken}/{summary?.week.total}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(16,185,129,0.08)' }}>
                <div className="h-full rounded-full fill-bar"
                  style={{
                    '--bar-w': `${summary?.week.adherenceRate ?? 0}%`,
                    background: 'linear-gradient(90deg, var(--teal), var(--emerald))',
                    boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                    width: `${summary?.week.adherenceRate ?? 0}%`,
                  } as React.CSSProperties} />
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="card stagger-4" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.2)' }}>
                <Clock size={15} style={{ color: '#ffb347' }} />
              </div>
              <h3 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Upcoming</h3>
            </div>
            {(summary?.upcoming.length ?? 0) === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: '#8b98a5' }}>No upcoming medicines</p>
            ) : (
              <div className="space-y-2">
                {summary?.upcoming.map((med) => (
                  <div key={med.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.07)', cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${med.name}`}
                    onClick={() => openMedicineDetails(med.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openMedicineDetails(med.id);
                      }
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(255,179,71,0.1)' }}>
                      <Activity size={13} style={{ color: '#ffb347' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{med.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(med.date), 'MMM d')} · {med.time}
                      </p>
                    </div>
                    <ChevronRight size={13} style={{ color: '#8b98a5' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <MedicineReminderPopup
      medicine={reminderMedicine}
      isOpen={reminderModalOpen}
      onClose={() => setReminderModalOpen(false)}
      onTakeMedicine={handleTakeMedicineFromPopup}
    />
    </>
  );
};
