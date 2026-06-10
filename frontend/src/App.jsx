import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Eagerly loaded components (essential for initial paint)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Pets from './pages/Pets';

// Lazy loaded components (heavy pages)
const AiAnalysis = lazy(() => import('./pages/AiAnalysis'));
const AiChat = lazy(() => import('./pages/AiChat'));
const Veterinarians = lazy(() => import('./pages/Veterinarians'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Community = lazy(() => import('./pages/Community'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } }
});

const GlobalSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent shadow-lg"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Suspense fallback={<GlobalSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes (all roles) */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
                  
                  {/* Lazy-loaded protected routes */}
                  <Route path="/ai-analysis" element={<ProtectedRoute><AiAnalysis /></ProtectedRoute>} />
                  <Route path="/ai-chat" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
                  <Route path="/veterinarians" element={<ProtectedRoute><Veterinarians /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/marketplace/cart" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />

                  {/* Admin-only routes */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '12px' } }} />
            </BrowserRouter>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
