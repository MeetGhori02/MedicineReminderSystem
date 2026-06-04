// Animated medical pulse / ECG loader
export const PulseLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const dims = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${dims[size]} relative`}>
        <div
          className="absolute inset-0 rounded-full border-2 border-teal-DEFAULT spin-glow"
          style={{ borderColor: 'var(--teal)', borderTopColor: 'transparent' }}
        />
        <div className="absolute inset-2 rounded-full border border-emerald-DEFAULT opacity-60 spin-glow"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s', borderColor: 'var(--emerald)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--teal)' }} />
        </div>
      </div>
      {size !== 'sm' && (
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      )}
    </div>
  );
};

// ECG heartbeat line loader
export const EcgLoader = () => (
  <div className="flex items-center gap-1" style={{ height: 32 }}>
    <svg viewBox="0 0 120 32" width={120} height={32}>
      <polyline
        points="0,16 18,16 24,4 30,28 36,8 42,24 46,16 120,16"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: 200,
          animation: 'ecgDraw 1.5s linear infinite',
        }}
      />
    </svg>
  </div>
);
