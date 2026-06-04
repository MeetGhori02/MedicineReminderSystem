import { useState, useEffect, FormEvent } from 'react';
import { X, Pill, Save } from 'lucide-react';
import { Medicine, MedicineFormData, Frequency, MealTiming } from '../../types';
import { medicineApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Props {
  medicine?: Medicine | null;
  onClose: () => void;
  onSaved: () => void;
}

const defaultForm: MedicineFormData = {
  name: '',
  dosage: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '08:00',
  frequency: 'DAILY',
  beforeAfterFood: 'AFTER',
  mealTimings: [],
  notes: '',
  reminderEnabled: true,
};

export const MedicineFormModal = ({ medicine, onClose, onSaved }: Props) => {
  const [form, setForm] = useState<MedicineFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(medicine);

  useEffect(() => {
    if (medicine) {
      setForm({
        name: medicine.name,
        dosage: medicine.dosage,
        date: format(new Date(medicine.date), 'yyyy-MM-dd'),
        time: medicine.time,
        frequency: medicine.frequency,
        mealTimings: medicine.mealTimings || [],
        beforeAfterFood: medicine.beforeAfterFood,
        notes: medicine.notes ?? '',
        reminderEnabled: medicine.reminderEnabled,
      });
    } else {
      setForm(defaultForm);
    }
  }, [medicine]);

  const update = <K extends keyof MedicineFormData>(field: K, value: MedicineFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleMealTiming = (timing: MealTiming) => {
    setForm(prev => ({
      ...prev,
      mealTimings: prev.mealTimings.includes(timing)
        ? prev.mealTimings.filter(t => t !== timing)
        : [...prev.mealTimings, timing]
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.date || !form.time) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEditing && medicine) {
        await medicineApi.update(medicine.id, form);
        toast.success('Medicine updated');
      } else {
        await medicineApi.create(form);
        toast.success('Medicine added 💊');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally { setLoading(false); }
  };

  const fieldStyle = { paddingLeft: 40 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="modal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'rgba(31,37,43,0.97)',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.1), inset 0 1px 0 rgba(16,185,129,0.1)',
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center pulse-ring"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Pill size={18} style={{ color: 'var(--teal)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal)', boxShadow: '0 0 6px var(--teal)' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--teal)' }}>
                  {isEditing ? 'Edit Record' : 'New Record'}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {isEditing ? 'Edit Medicine' : 'Add Medicine'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,109,0.1)'; e.currentTarget.style.color = '#ff4d6d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Medicine Name *</label>
            <div className="relative">
              <Pill size={14} className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, color: 'var(--text-muted)' }} />
              <input type="text" className="input-field" style={fieldStyle}
                placeholder="e.g. Paracetamol, Metformin..."
                value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Dosage *</label>
            <input type="text" className="input-field"
              placeholder="e.g. 500mg, 1 tablet, 2 capsules..."
              value={form.dosage} onChange={e => update('dosage', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input-field"
                value={form.date} onChange={e => update('date', e.target.value)} required />
            </div>
            <div>
              <label className="label">Time *</label>
              <input type="time" className="input-field"
                value={form.time} onChange={e => update('time', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Frequency</label>
            <select className="input-field" value={form.frequency}
              onChange={e => update('frequency', e.target.value as Frequency)}>
              <option value="ONCE">Once</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>

          <div>
            <label className="label">Meal Timings <span style={{ color: '#8b98a5', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(select one or more)</span></label>
            <div className="space-y-2 mt-2">
              {[
                { value: 'AFTER_BREAKFAST' as MealTiming, label: 'After Breakfast' },
                { value: 'AFTER_LUNCH' as MealTiming, label: 'After Lunch' },
                { value: 'AFTER_DINNER' as MealTiming, label: 'After Dinner' }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: form.mealTimings.includes(value) ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.02)',
                    border: `1px solid ${form.mealTimings.includes(value) ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.1)'}`,
                  }}
                  onMouseEnter={e => {
                    if (!form.mealTimings.includes(value)) {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!form.mealTimings.includes(value)) {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.1)';
                    }
                  }}>
                  <input
                    type="checkbox"
                    checked={form.mealTimings.includes(value)}
                    onChange={() => toggleMealTiming(value)}
                    className="w-4 h-4 rounded transition-all cursor-pointer"
                    style={{
                      accentColor: 'var(--teal)',
                      cursor: 'pointer'
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: form.mealTimings.includes(value) ? 'var(--teal)' : 'var(--text-muted)' }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes <span style={{ color: '#8b98a5', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="e.g. Take with water, Avoid dairy..."
              value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>

          {/* Reminder toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enable Reminder</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Browser notification at scheduled time</p>
            </div>
            <button type="button" onClick={() => update('reminderEnabled', !form.reminderEnabled)}
              className="relative transition-all duration-300 rounded-full"
              style={{ width: 48, height: 26, background: form.reminderEnabled ? 'linear-gradient(135deg, var(--teal), var(--emerald))' : 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: form.reminderEnabled ? '0 0 12px rgba(16,185,129,0.3)' : 'none' }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: form.reminderEnabled ? 22 : 2 }} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 spin-glow" style={{ borderColor: 'var(--bg-deep)', borderTopColor: 'transparent' }} />
                : <><Save size={15} />{isEditing ? 'Update' : 'Save'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
