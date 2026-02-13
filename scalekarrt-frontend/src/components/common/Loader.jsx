export default function Loader({ size = 'md', fullScreen = false, label = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
      <div
        className={`
          ${sizes[size]}
          border-primary-200 border-t-primary-600
          rounded-full animate-spin
        `}
      />
      <span className="text-sm text-gray-500 sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-8">{spinner}</div>;
}
