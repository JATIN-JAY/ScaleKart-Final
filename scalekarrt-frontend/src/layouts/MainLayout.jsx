import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<Loader fullScreen />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
