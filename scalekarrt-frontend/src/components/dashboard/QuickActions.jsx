import { Link } from 'react-router-dom';
import Card from '../common/Card';

export default function QuickActions({ actions = [] }) {
  if (actions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link key={action.path} to={action.path}>
            <Card hover className="text-center p-6">
              {Icon && (
                <Icon
                  className="w-12 h-12 mx-auto mb-3 text-primary-600"
                  aria-hidden="true"
                />
              )}
              <h3 className="font-semibold mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
