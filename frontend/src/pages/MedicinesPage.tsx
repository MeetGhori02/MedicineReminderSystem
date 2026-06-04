import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pill, Edit2, Trash2, CheckCircle2, Bell, BellOff, Filter, RefreshCw, Activity } from 'lucide-react';
import { medicineApi } from '../services/api';
import { Medicine } from '../types';
import { MedicineFormModal } from '../components/ui/MedicineFormModal';
import { PulseLoader } from '../components/ui/PulseLoader';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

// ── Frequency badge colors ─────────────────────────────────────────────────────
const freqStyle: Record<string, { bg: string; color: string }> = {
  ONCE:   { bg: 'rgba(148,163,184,0.12)', color: 'var(--text-muted)' },
  DAILY:  { bg: 'rgba(16,185,129,0.1)',    color: 'var(--teal)' },
  WEEKLY: { bg: 'rgba(56,240,255,0.1)',   color: '#86efac' },
};

// ── Medicine card ──────────────────────────────────────────────────────────────
const MedCard = ({
  med, index, onEdit, onDelete, onToggle,
}: {
  med: Medicine; index: number;
  onEdit: (m: Medicine) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, t: boolean) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const fs = freqStyle[med.frequency] ?? freqStyle.ONCE;

  return (
    <div
      className={`card stagger-1`}
      style={{ animationDelay: `${index * 0.05}s`, borderColor: hovered ? 'rgba(16,185,129,0.3)' : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: med.taken ? 'rgba(52,211,153,0.12)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${med.taken ? 'rgba(52,211,153,0.3)' : 'rgba(16,185,129,0.2)'}`,
            }}>
            <Pill size={18} style={{ color: med.taken ? 'var(--emerald)' : 'var(--teal)' }} />
            {med.taken && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center check-pop"
                style={{ background: 'var(--emerald)', fontSize: 9 }}>✓</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-base truncate"
              style={{ color: 'var(--text-primary)', opacity: med.taken ? 0.55 : 1, textDecoration: med.taken ? 'line-through' : 'none' }}>
              {med.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{med.dosage}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {[
            { icon: <CheckCircle2 size={16} />, color: med.taken ? 'var(--emerald)' : 'var(--text-muted)', hoverColor: 'var(--emerald)', hoverBg: 'rgba(52,211,153,0.1)', action: () => onToggle(med.id, !med.taken), title: med.taken ? 'Mark untaken' : 'Mark taken' },
            { icon: <Edit2 size={15} />,       color: 'var(--text-muted)',                          hoverColor: 'var(--teal)', hoverBg: 'rgba(16,185,129,0.1)',  action: () => onEdit(med), title: 'Edit' },
            { icon: <Trash2 size={15} />,      color: 'var(--text-muted)',                          hoverColor: '#ff4d6d', hoverBg: 'rgba(255,77,109,0.1)', action: () => onDelete(med.id), title: 'Delete' },
          ].map((btn, i) => (
            <button key={i} title={btn.title} onClick={btn.action}
              className="p-2 rounded-lg transition-all duration-150"
              style={{ color: btn.color }}
              onMouseEnter={e => { e.currentTarget.style.color = btn.hoverColor; e.currentTarget.style.background = btn.hoverBg; }}
              onMouseLeave={e => { e.currentTarget.style.color = btn.color; e.currentTarget.style.background = 'transparent'; }}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium"
          style={{ background: 'rgba(16,185,129,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(16,185,129,0.1)' }}>
          📅 {format(new Date(med.date), 'MMM d, yyyy')}
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold font-display"
          style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--teal)', border: '1px solid rgba(16,185,129,0.15)' }}>
          ⏰ {med.time}
        </div>

        {/* Frequency */}
        <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
          style={{ background: fs.bg, color: fs.color }}>
          {med.frequency.charAt(0) + med.frequency.slice(1).toLowerCase()}
        </span>

        {/* Meal timings */}
        {med.mealTimings && med.mealTimings.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
            style={{ background: 'rgba(147,112,219,0.1)', color: '#9370db' }}>
            {med.mealTimings.map(mt => mt.replace('AFTER_', '').toLowerCase()).join(', ')}
          </span>
        )}

        {/* Reminder */}
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold"
          style={{
            background: med.reminderEnabled ? 'rgba(16,185,129,0.08)' : 'rgba(148,163,184,0.08)',
            color: med.reminderEnabled ? 'var(--teal)' : '#8b98a5',
          }}>
          {med.reminderEnabled ? <Bell size={10} /> : <BellOff size={10} />}
          {med.reminderEnabled ? 'On' : 'Off'}
        </span>
      </div>

      {/* Notes */}
      {med.notes && (
        <p className="mt-3 text-xs italic" style={{ color: '#8b98a5', borderTop: '1px solid rgba(16,185,129,0.06)', paddingTop: 10 }}>
          📝 {med.notes}
        </p>
      )}

      {/* Taken at */}
      {med.taken && med.takenAt && (
        <p className="mt-2 text-xs font-medium" style={{ color: 'var(--emerald)' }}>
          ✅ Taken at {format(new Date(med.takenAt), 'h:mm a')}
        </p>
      )}

      {/* Hover scan line */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute w-full h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)', animation: 'scanLine 2s linear infinite', opacity: 0.6 }} />
        </div>
      )}
    </div>
  );
};

// ── Delete confirm modal ───────────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
    style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(8px)' }}>
    <div className="modal-panel w-full max-w-sm rounded-2xl p-6"
      style={{
        background: 'rgba(31,37,43,0.97)', border: '1px solid rgba(255,77,109,0.3)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 30px rgba(255,77,109,0.1)',
      }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.3)' }}>
        <Trash2 size={24} style={{ color: '#ff4d6d' }} />
      </div>
      <h3 className="font-display font-bold text-lg text-center mb-2" style={{ color: 'var(--text-primary)' }}>Delete Medicine?</h3>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button onClick={onConfirm} className="btn-danger flex-1 justify-center">Delete</button>
      </div>
    </div>
  </div>
);

// ── Medicines Page ─────────────────────────────────────────────────────────────
export const MedicinesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [lastHandledMedicineId, setLastHandledMedicineId] = useState<string | null>(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await medicineApi.getAll({ search: search || undefined, date: dateFilter || undefined });
      if (data.success) setMedicines(data.data);
    } catch { toast.error('Failed to load medicines'); }
    finally { setLoading(false); }
  }, [search, dateFilter]);

  useEffect(() => {
    const t = setTimeout(fetchMedicines, 300);
    return () => clearTimeout(t);
  }, [fetchMedicines]);

  useEffect(() => {
    if (loading) return;
    const medicineIdParam = searchParams.get('medicineId');
    if (!medicineIdParam) return;
    if (medicineIdParam === lastHandledMedicineId) return;

    const medicineId = Number(medicineIdParam);
    const params = new URLSearchParams(searchParams);
    params.delete('medicineId');
    setSearchParams(params, { replace: true });
    setLastHandledMedicineId(medicineIdParam);

    if (Number.isNaN(medicineId)) return;

    const target = medicines.find((med) => med.id === medicineId);
    if (!target) {
      toast.error('Medicine not found');
      return;
    }

    setEditingMed(target);
    setShowModal(true);
  }, [loading, lastHandledMedicineId, medicines, searchParams, setSearchParams]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await medicineApi.delete(deleteId); toast.success('Medicine deleted'); fetchMedicines(); }
    catch { toast.error('Delete failed'); }
    finally { setDeleteId(null); }
  };

  const handleToggle = async (id: number, taken: boolean) => {
    try { await medicineApi.markTaken(id, taken); toast.success(taken ? '✅ Marked as taken' : 'Marked as not taken'); fetchMedicines(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between stagger-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} style={{ color: 'var(--teal)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--teal)' }}>Medicine Vault</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My Medicines</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{medicines.length} record{medicines.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={() => { setEditingMed(null); setShowModal(true); }} className="btn-primary">
          <Plus size={17} /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 stagger-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
          <input type="text" className="input-field" style={{ paddingLeft: 40 }}
            placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
          <input type="date" className="input-field w-full sm:w-48" style={{ paddingLeft: 40 }}
            value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        {(search || dateFilter) && (
          <button onClick={() => { setSearch(''); setDateFilter(''); }} className="btn-secondary shrink-0">
            <RefreshCw size={14} /> Clear
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><PulseLoader /></div>
      ) : medicines.length === 0 ? (
        <div className="card text-center py-16 stagger-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <Pill size={28} style={{ color: 'rgba(16,185,129,0.25)' }} />
          </div>
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-muted)' }}>
            {search || dateFilter ? 'No medicines found' : 'No medicines yet'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#8b98a5' }}>
            {search || dateFilter ? 'Try adjusting your search' : 'Add your first medicine to start tracking'}
          </p>
          {!search && !dateFilter && (
            <button onClick={() => { setEditingMed(null); setShowModal(true); }} className="btn-primary mx-auto">
              <Plus size={16} /> Add Medicine
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {medicines.map((med, i) => (
            <MedCard key={med.id} med={med} index={i}
              onEdit={m => { setEditingMed(m); setShowModal(true); }}
              onDelete={setDeleteId}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {showModal && (
        <MedicineFormModal medicine={editingMed} onClose={() => setShowModal(false)} onSaved={fetchMedicines} />
      )}
      {deleteId && <DeleteModal onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
};
