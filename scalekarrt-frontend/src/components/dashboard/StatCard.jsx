export default function StatCard({
  title,
  value,
  icon: Icon,
  bgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  subtitle,
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`${bgColor} p-3 rounded-lg`}>
            <Icon
              className={`w-8 h-8 ${iconColor}`}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
}
