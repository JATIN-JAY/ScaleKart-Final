import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data.analytics || null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>Retry</Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 text-gray-500">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>
      <AnalyticsDashboard analytics={analytics} />
    </div>
  );
}
