import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAppStore } from './store/useAppStore';
import { getCurrentUser } from './lib/supabase';
import ErrorBoundary from './screens/Shared/ErrorBoundary';
import type { User } from './types';

const Home = lazy(() => import('./screens/Home/Home'));
const AuthScreen = lazy(() => import('./screens/Auth/AuthScreen'));
const ConsumerDashboard = lazy(() => import('./screens/Consumer/ConsumerDashboard'));
const SupplierDashboard = lazy(() => import('./screens/Supplier/SupplierDashboard'));
const AdminDashboard = lazy(() => import('./screens/Admin/AdminDashboard'));
const DocHome = lazy(() => import('./screens/Documentation/DocHome'));
const ProductDoc = lazy(() => import('./screens/Documentation/ProductDoc'));
const ImplementationDoc = lazy(() => import('./screens/Documentation/ImplementationDoc'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg" role="status" aria-label="लोड होत आहे...">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" aria-hidden="true" />
    </div>
  );
}

export default function App() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    getCurrentUser()
      .then((u) => { if (u) setUser(u as unknown as User); })
      .catch(() => {});
  }, [setUser]);

  useEffect(() => {
    const handleOnline = () => useAppStore.getState().setOnline(true);
    const handleOffline = () => useAppStore.getState().setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/documentation" element={<DocHome />} />
          <Route path="/documentation/product" element={<ProductDoc />} />
          <Route path="/documentation/implementation" element={<ImplementationDoc />} />

          {/* Authenticated */}
          <Route
            path="/consumer/*"
            element={currentUser?.role === 'consumer' ? <ConsumerDashboard /> : <Navigate to="/auth" />}
          />
          <Route
            path="/supplier/*"
            element={currentUser?.role === 'supplier' ? <SupplierDashboard /> : <Navigate to="/auth" />}
          />
          <Route
            path="/admin/*"
            element={currentUser?.role === 'superadmin' ? <AdminDashboard /> : <Navigate to="/auth" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
