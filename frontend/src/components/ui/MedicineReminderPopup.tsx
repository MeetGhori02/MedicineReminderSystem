import { useEffect, useState } from 'react';
import { X, Pill, Clock, Droplets, AlertCircle } from 'lucide-react';
import { Medicine } from '../../types';
import toast from 'react-hot-toast';

interface MedicineReminderPopupProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onTakeMedicine: (id: number) => void;
  isLoading?: boolean;
}

export const MedicineReminderPopup = ({
  medicine,
  isOpen,
  onClose,
  onTakeMedicine,
}: MedicineReminderPopupProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleTakeMedicine = async () => {
    if (!medicine) return;
    try {
      await onTakeMedicine(medicine.id);
      toast.success(`${medicine.name} marked as taken!`);
      handleClose();
    } catch (error) {
      toast.error('Failed to mark medicine as taken');
    }
  };

  if (!isOpen || !medicine) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 transition-all duration-300 ${
          isAnimating
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with accent color */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-lg p-2 hover:bg-white/20 transition-colors z-10"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Icon and Title */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                <Pill size={32} className="text-white animate-pulse" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">REMINDER</p>
                <h2 className="text-2xl font-bold text-white">Time for {medicine.name}</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 space-y-5">
            {/* Dosage */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
              <Droplets className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Dosage</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {medicine.dosage}
                </p>
              </div>
            </div>

            {/* Food Timing */}
            <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
              <AlertCircle className="text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Take {medicine.beforeAfterFood}</p>
                <p className="text-slate-700 dark:text-slate-300 mt-1">
                  {medicine.beforeAfterFood === 'BEFORE'
                    ? 'Take 30 min before meals'
                    : medicine.beforeAfterFood === 'AFTER'
                    ? 'Take 1 hour after meals'
                    : 'Take with meals'}
                </p>
              </div>
            </div>

            {/* Scheduled Time */}
            <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Clock className="text-slate-600 dark:text-slate-300 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Scheduled Time</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{medicine.time}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-6 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Remind Later
            </button>
            <button
              onClick={handleTakeMedicine}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
            >
              ✓ Take Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
