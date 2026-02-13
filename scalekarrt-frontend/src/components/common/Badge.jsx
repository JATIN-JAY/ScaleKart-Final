const VARIANTS = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

export default function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-semibold rounded-full
        ${VARIANTS[variant] || VARIANTS.primary}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
