export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`
        card rounded-2xl border bg-white shadow-sm
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
