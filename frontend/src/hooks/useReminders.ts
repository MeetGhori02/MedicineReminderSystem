import { useEffect, useCallback } from 'react';
import { Medicine } from '../types';

interface UseRemindersOptions {
  onReminderTriggered?: (medicine: Medicine) => void;
}

export const useReminders = (medicines: Medicine[], options?: UseRemindersOptions) => {
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Play a short beep sound for reminders
  const playAlert = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      console.log('Audio not supported');
    }
  }, []);

  // Show browser notification
  const showNotification = useCallback((medicine: Medicine) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const notification = new Notification(`💊 Time for ${medicine.name}!`, {
      body: `Dosage: ${medicine.dosage} — ${medicine.beforeAfterFood} food`,
      icon: '/pill.svg',
      tag: `medicine-${medicine.id}`,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    playAlert();
  }, [playAlert]);

  // Check every minute if any medicine is due
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hh}:${mm}`;

      medicines.forEach((med) => {
        if (
          med.time === currentTime &&
          !med.taken &&
          med.reminderEnabled
        ) {
          showNotification(med);
          // Trigger popup callback if provided
          if (options?.onReminderTriggered) {
            options.onReminderTriggered(med);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [medicines, showNotification, options]);

  return { showNotification, playAlert };
};
