import React, { useState, useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { AppProvider, useApp } from './context/AppContext';
import { RequireAuth, RequireRole } from './auth/RouteGuards';
import { useRealtimeSubscriptions } from './hooks/useRealtime';
import { useDesignsRealtime } from './hooks/useDesignsRealtime';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ViewModeProvider } from './context/ViewModeContext';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Code-split pages for instant initial page load
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SalesDashboard = lazy(() => import('./pages/sales/SalesDashboard').then(m => ({ default: m.SalesDashboard })));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const DesignsPage = lazy(() => import('./pages/designs/DesignsPage').then(m => ({ default: m.DesignsPage })));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage').then(m => ({ default: m.OrdersPage })));
const SalesTeamPage = lazy(() => import('./pages/sales/SalesTeamPage').then(m => ({ default: m.SalesTeamPage })));
const ManufacturersPage = lazy(() => import('./pages/manufacturers/ManufacturersPage').then(m => ({ default: m.ManufacturersPage })));
const PaymentsPage = lazy(() => import('./pages/payments/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const FollowUpsPage = lazy(() => import('./pages/sales/FollowUpsPage').then(m => ({ default: m.FollowUpsPage })));
const VisitsPage = lazy(() => import('./pages/sales/VisitsPage').then(m => ({ default: m.VisitsPage })));
const CollectionsPage = lazy(() => import('./pages/sales/CollectionsPage').then(m => ({ default: m.CollectionsPage })));
const ReceiptPage = lazy(() => import('./pages/payments/ReceiptPage').then(m => ({ default: m.ReceiptPage })));
const LoginPage = lazy(() => import('./pages/login/LoginPage').then(m => ({ default: m.LoginPage })));
const LandingPage = lazy(() => import('./pages/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const PublicLookbookPage = lazy(() => import('./pages/public/PublicLookbookPage').then(m => ({ default: m.PublicLookbookPage })));

const TotalCustomersInsightPage = lazy(() => import('./pages/customers/insights').then(m => ({ default: m.TotalCustomersInsightPage })));
const TotalReceivablesInsightPage = lazy(() => import('./pages/customers/insights').then(m => ({ default: m.TotalReceivablesInsightPage })));
const OverdueAccountsInsightPage = lazy(() => import('./pages/customers/insights').then(m => ({ default: m.OverdueAccountsInsightPage })));
const ClearedAccountsInsightPage = lazy(() => import('./pages/customers/insights').then(m => ({ default: m.ClearedAccountsInsightPage })));

const RecordPaymentModal = lazy(() => import('./components/payments/RecordPaymentModal').then(m => ({ default: m.RecordPaymentModal })));
const CreateOrderWizardModal = lazy(() => import('./components/orders/CreateOrderWizardModal').then(m => ({ default: m.CreateOrderWizardModal })));
const AddCustomerModal = lazy(() => import('./components/customers/AddCustomerModal').then(m => ({ default: m.AddCustomerModal })));
const EditCustomerModal = lazy(() => import('./components/customers/EditCustomerModal').then(m => ({ default: m.EditCustomerModal })));
const ShareLookbookModal = lazy(() => import('./components/designs/ShareLookbookModal').then(m => ({ default: m.ShareLookbookModal })));
const DemoWalkthroughModal = lazy(() => import('./components/demo/DemoWalkthroughModal').then(m => ({ default: m.DemoWalkthroughModal })));
const AddManufacturerModal = lazy(() => import('./components/manufacturers/AddManufacturerModal').then(m => ({ default: m.AddManufacturerModal })));
const PlatformAdminPage = lazy(() => import('./pages/admin/PlatformAdminPage').then(m => ({ default: m.PlatformAdminPage })));
const AccountsPage = lazy(() => import('./pages/platform/AccountsPage').then(m => ({ default: m.AccountsPage })));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

const getInitialPath = (defaultRole?: string): string => {
  if (typeof window === 'undefined') return '/landing';

  const pathname = window.location.pathname;
  const hash = window.location.hash;

  // 1. Direct browser URL path (e.g. /sales/visits, /admin/orders, /admin/customers)
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/sales') ||
    pathname.startsWith('/platform') ||
    pathname.startsWith('/receipts/') ||
    pathname.startsWith('/customers/insights')
  ) {
    return pathname;
  }

  // 2. Hash-based route fallback
  if (hash) {
    const cleanHash = hash.replace(/^#\/?/, '/');
    if (
      cleanHash.startsWith('/admin') ||
      cleanHash.startsWith('/sales') ||
      cleanHash.startsWith('/platform') ||
      cleanHash.startsWith('/receipts/') ||
      cleanHash.startsWith('/customers/insights')
    ) {
      return cleanHash;
    }
  }

  return '/landing';
};

const AppContent: React.FC = () => {
  const {
    currentUser,
    isLoggedIn: appIsLoggedIn,
    toastMessage,
    showToast,
    setIsMobileSidebarOpen,
    isDarkMode,
    setSalesTeam,
    setCustomers,
    setOrders,
    setPayments,
    setFollowUps,
    setFieldVisits,
    setNotifications,
  } = useApp();

  const { user: authUser, role: authRole, isLoggedIn: authIsLoggedIn } = useAuth();
  const isLoggedIn = Boolean(authUser || authIsLoggedIn || (appIsLoggedIn && currentUser));
  const effectiveRole = authRole || currentUser?.role || 'admin';

  const [currentPath, setCurrentPath] = useState<string>(() =>
    getInitialPath(currentUser?.role)
  );

  const [unauthView, setUnauthView] = useState<'landing' | 'login' | 'signup' | 'forgot_password' | 'reset_password' | 'lookbook' | 'app'>(() => {
    if (typeof window === 'undefined') return 'landing';
    const hash = window.location.hash;
    const pathname = window.location.pathname;
    if (hash.startsWith('#s/') || pathname.startsWith('/s/')) return 'lookbook';
    if (hash === '#auth/forgot-password') return 'forgot_password';
    if (hash === '#auth/reset') return 'reset_password';
    if (hash === '#signup' || hash === '#auth/signup' || pathname === '/signup') return 'signup';
    if (hash === '#login' || hash === '#auth/login' || pathname === '/login') return 'login';
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/sales') ||
      pathname.startsWith('/platform') ||
      pathname.startsWith('/receipts/') ||
      pathname.startsWith('/customers/insights')
    ) {
      return 'app';
    }
    return 'landing';
  });
  const [activeShareToken, setActiveShareToken] = useState<string>('');

  // Live Supabase Realtime subscriptions with instant multi-table sync
  useRealtimeSubscriptions({
    userId: authUser?.id || currentUser?.id,
    userRole: authRole || currentUser?.role,
    userName: authUser?.name || currentUser?.name,
    onNotification: (msg) => {
      showToast(msg);
    },
    setSalesTeam,
    setCustomers,
    setOrders,
    setPayments,
    setFollowUps,
    setFieldVisits,
    setNotifications,
  });

  // Live Supabase Realtime synchronization for shoe designs catalog
  useDesignsRealtime({
    isSalesperson: authRole === 'salesperson',
    onNewDesign: (name, articleCode) => {
      showToast(`New design added: ${name}${articleCode ? ` (${articleCode})` : ''}`);
    },
  });

  // Sync theme mode to documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    }
  }, [isDarkMode]);

  // Handle browser Back / Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (
        p.startsWith('/admin') ||
        p.startsWith('/sales') ||
        p.startsWith('/platform') ||
        p.startsWith('/receipts/') ||
        p.startsWith('/customers/insights') ||
        p === '/landing'
      ) {
        setCurrentPath(p);
        localStorage.setItem('soleflow_active_path', p);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // URL hash and path routing for direct link access
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      if (hash.startsWith('#receipts/')) {
        const pId = hash.replace('#receipts/', '');
        setCurrentPath(`/receipts/${pId}`);
        setUnauthView('app');
      } else if (pathname.startsWith('/receipts/')) {
        setCurrentPath(pathname);
        setUnauthView('app');
      } else if (hash.startsWith('#s/')) {
        const token = hash.replace('#s/', '');
        setActiveShareToken(token);
        setUnauthView('lookbook');
      } else if (pathname.startsWith('/s/')) {
        const token = pathname.replace('/s/', '');
        setActiveShareToken(token);
        setUnauthView('lookbook');
      } else if (hash === '#auth/forgot-password') {
        setUnauthView('forgot_password');
      } else if (hash === '#auth/reset') {
        setUnauthView('reset_password');
      } else if (hash === '#login' || hash === '#auth/login' || pathname === '/login') {
        setUnauthView('login');
      } else if (hash === '#signup' || hash === '#auth/signup' || pathname === '/signup') {
        setUnauthView('signup');
      } else if (hash === '#landing' || hash === '#home' || pathname === '/landing' || pathname === '/') {
        setUnauthView('landing');
      } else if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/sales') ||
        pathname.startsWith('/platform') ||
        pathname.startsWith('/customers/insights') ||
        hash.startsWith('#admin') ||
        hash.startsWith('#sales') ||
        hash.startsWith('#app')
      ) {
        if (pathname.length > 1 && pathname !== '/') {
          setCurrentPath(pathname);
        }
        setUnauthView(isLoggedIn ? 'app' : 'login');
      } else {
        setUnauthView('landing');
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, [isLoggedIn]);

  // Keep browser URL and localStorage in sync with currentPath
  useEffect(() => {
    if (isLoggedIn && currentPath && unauthView === 'app') {
      try {
        localStorage.setItem('soleflow_active_path', currentPath);
        if (window.location.pathname !== currentPath && !window.location.hash.startsWith('#s/')) {
          window.history.replaceState({ path: currentPath }, '', currentPath);
        }
      } catch (e) {
        console.warn('History replaceState error:', e);
      }
    }
  }, [currentPath, isLoggedIn, unauthView]);

  // Sync route on role switch (only restrict salesperson from admin paths)
  useEffect(() => {
    if (currentUser.role === 'salesperson' && currentPath.startsWith('/admin')) {
      setCurrentPath('/sales/dashboard');
    }
    setIsMobileSidebarOpen(false);
  }, [currentUser.role, currentPath, setIsMobileSidebarOpen]);

  // Ensure mobile menu is closed on route change or when logging in
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentPath, isLoggedIn, setIsMobileSidebarOpen]);

  // Handle navigation
  const handleNavigate = (path: string) => {
    setIsMobileSidebarOpen(false);
    // Restrict salesperson from admin paths
    if (currentUser.role === 'salesperson' && path.startsWith('/admin')) {
      showToast('Restricted: Trader Admin privileges required');
      path = '/sales/dashboard';
    }
    setCurrentPath(path);
    try {
      localStorage.setItem('soleflow_active_path', path);
      if (window.location.pathname !== path) {
        window.history.pushState({ path }, '', path);
      }
    } catch (e) {
      console.warn('History navigation error:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Anonymous Public Share Lookbook Route (/s/:token or #s/:token)
  if (unauthView === 'lookbook') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <PublicLookbookPage
          shareToken={activeShareToken || 'token-abc-001'}
          onReturnToApp={() => {
            window.location.hash = '#login';
            setUnauthView('login');
          }}
        />
      </Suspense>
    );
  }

  // 2. Forgot / Reset Password
  if (unauthView === 'forgot_password') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ForgotPasswordPage
          onBackToLogin={() => {
            window.location.hash = '#login';
            setUnauthView('login');
          }}
        />
      </Suspense>
    );
  }

  if (unauthView === 'reset_password') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <ResetPasswordPage
          onSuccess={() => {
            window.location.hash = '#login';
            setUnauthView('login');
          }}
        />
      </Suspense>
    );
  }

  const handleLoginSuccess = (role: 'admin' | 'salesperson') => {
    setIsMobileSidebarOpen(false);
    const targetPath = role === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
    setCurrentPath(targetPath);
    setUnauthView('app');
    try {
      localStorage.setItem('soleflow_active_path', targetPath);
      if (window.location.hash) {
        window.history.replaceState({ path: targetPath }, '', targetPath);
      } else if (window.location.pathname !== targetPath) {
        window.history.pushState({ path: targetPath }, '', targetPath);
      }
    } catch (e) {
      console.warn('History navigation error:', e);
    }
  };

  // 3. Public Landing Page (Default for root URL /)
  if (unauthView === 'landing') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <LandingPage
          isAlreadyLoggedIn={isLoggedIn}
          onReturnToDashboard={() => {
            const targetPath = effectiveRole === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
            setCurrentPath(targetPath);
            setUnauthView('app');
            try {
              if (window.location.pathname !== targetPath) {
                window.history.pushState({ path: targetPath }, '', targetPath);
              }
            } catch (e) {}
          }}
          onLoginSuccess={handleLoginSuccess}
          onNavigateToLogin={(mode = 'login') => {
            window.location.hash = mode;
            setUnauthView(mode);
          }}
        />
      </Suspense>
    );
  }

  // 4. Login / Signup Page
  if (unauthView === 'login' || unauthView === 'signup' || !isLoggedIn) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <LoginPage
          initialMode={unauthView === 'signup' ? 'signup' : 'login'}
          onSuccess={handleLoginSuccess}
          onBackToLanding={() => {
            window.location.hash = '#landing';
            setUnauthView('landing');
          }}
          onForgotPassword={() => {
            window.location.hash = '#auth/forgot-password';
            setUnauthView('forgot_password');
          }}
        />
      </Suspense>
    );
  }

  // 3. Authenticated Page Content based on currentPath
  const renderPage = () => {
    // Separate base pathname and query parameters (e.g. /admin/orders?inspect=ORD-0145)
    const [rawBase, queryString] = currentPath.split('?');
    const basePath = rawBase.split('#')[0];
    const searchParams = new URLSearchParams(queryString || (typeof window !== 'undefined' ? window.location.search : ''));

    // Public Landing Page view for authenticated user
    if (basePath === '/landing') {
      return (
        <LandingPage
          isAlreadyLoggedIn={true}
          onLoginSuccess={(role) => {
            setCurrentPath(role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
          }}
          onReturnToDashboard={() => {
            setCurrentPath(currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
          }}
        />
      );
    }

    // Helper to extract return referrer path
    const getFromPath = (path: string) => {
      if (path.includes('from=')) {
        const match = path.match(/from=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
      return currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
    };

    // Customer Insight Detail Pages (Accessible to both Admin & Sales with role-based filtering)
    if (basePath.includes('/customers/insights/total')) {
      return <TotalCustomersInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }
    if (basePath.includes('/customers/insights/receivables')) {
      return <TotalReceivablesInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }
    if (basePath.includes('/customers/insights/overdue')) {
      return <OverdueAccountsInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }
    if (basePath.includes('/customers/insights/cleared')) {
      return <ClearedAccountsInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }

    // Platform routes redirect to Admin Dashboard
    if (
      basePath === '/platform/accounts' ||
      basePath === '/admin/accounts' ||
      basePath === '/platform' ||
      basePath === '/admin/platform'
    ) {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/admin/dashboard')}>
          <AdminDashboard onNavigate={handleNavigate} />
        </RequireRole>
      );
    }

    // Admin routes guarded by RequireRole
    if (basePath === '/admin/dashboard') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <AdminDashboard onNavigate={handleNavigate} />
        </RequireRole>
      );
    }

    if (basePath === '/admin/customers' || basePath.startsWith('/admin/customers/')) {
      const match = basePath.match(/\/admin\/customers\/([^?#/]+)/);
      const customerId = match && match[1] !== 'insights' ? match[1] : undefined;
      return <CustomersPage onNavigate={handleNavigate} customerId={customerId} fromPath="/admin/customers" />;
    }
    if (basePath === '/admin/designs') {
      return <DesignsPage onNavigate={handleNavigate} />;
    }
    if (basePath === '/admin/orders' || basePath.startsWith('/admin/orders/')) {
      return (
        <OrdersPage
          onNavigate={handleNavigate}
          inspectOrderId={searchParams.get('inspect') || searchParams.get('orderId') || undefined}
          initialStatus={searchParams.get('status') || undefined}
          initialFilter={searchParams.get('filter') || undefined}
        />
      );
    }
    if (basePath === '/admin/sales-team') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <SalesTeamPage onNavigate={handleNavigate} />
        </RequireRole>
      );
    }
    if (basePath === '/admin/manufacturers') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <ManufacturersPage onNavigate={handleNavigate} />
        </RequireRole>
      );
    }
    if (basePath === '/admin/payments') {
      return (
        <PaymentsPage
          onNavigate={handleNavigate}
          initialAging={searchParams.get('aging') || undefined}
          initialTab={(searchParams.get('tab') as 'receivables' | 'payments') || undefined}
        />
      );
    }
    if (basePath === '/admin/reports') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <ReportsPage />
        </RequireRole>
      );
    }
    if (basePath === '/admin/settings') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <SettingsPage />
        </RequireRole>
      );
    }
    if (basePath === '/admin/notifications') {
      return <NotificationsPage onNavigate={handleNavigate} />;
    }

    // Sales routes
    if (basePath === '/sales/dashboard') {
      return <SalesDashboard onNavigate={handleNavigate} />;
    }
    if (basePath === '/sales/customers' || basePath.startsWith('/sales/customers/')) {
      const match = basePath.match(/\/sales\/customers\/([^?#/]+)/);
      const customerId = match && match[1] !== 'insights' ? match[1] : undefined;
      return <CustomersPage onNavigate={handleNavigate} customerId={customerId} fromPath="/sales/customers" />;
    }
    if (basePath === '/sales/designs' || basePath === '/sales/catalogue') {
      return <DesignsPage onNavigate={handleNavigate} />;
    }
    if (basePath === '/sales/orders') {
      return (
        <OrdersPage
          onNavigate={handleNavigate}
          inspectOrderId={searchParams.get('inspect') || searchParams.get('orderId') || undefined}
          initialStatus={searchParams.get('status') || undefined}
          initialFilter={searchParams.get('filter') || undefined}
        />
      );
    }
    if (basePath === '/sales/collections' || basePath === '/sales/payments' || basePath === '/collections') {
      return <CollectionsPage onNavigate={handleNavigate} />;
    }
    if (basePath === '/sales/follow-ups') {
      return <FollowUpsPage />;
    }
    if (basePath === '/sales/visits') {
      return <VisitsPage />;
    }
    if (basePath === '/sales/notifications') {
      return <NotificationsPage onNavigate={handleNavigate} />;
    }
    if (basePath === '/sales/activity') {
      return <SalesTeamPage onNavigate={handleNavigate} />;
    }
    if (basePath.startsWith('/receipts/')) {
      const match = basePath.match(/\/receipts\/([^?#/]+)/);
      const paymentId = match ? match[1] : undefined;
      return (
        <ReceiptPage
          paymentId={paymentId}
          onBack={() => handleNavigate(currentUser.role === 'admin' ? '/admin/payments' : '/sales/collections')}
        />
      );
    }

    if (basePath === '/sales/profile' || basePath === '/sales/settings') {
      return <SettingsPage />;
    }

    // Top-level aliases for direct navigation (e.g. /designs, /orders, /customers, /payments)
    if (basePath === '/designs') {
      return <DesignsPage onNavigate={handleNavigate} />;
    }
    if (basePath === '/customers' || basePath.startsWith('/customers/')) {
      const match = basePath.match(/\/customers\/([^?#/]+)/);
      const customerId = match && match[1] !== 'insights' ? match[1] : undefined;
      return <CustomersPage onNavigate={handleNavigate} customerId={customerId} fromPath={currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'} />;
    }
    if (basePath === '/orders' || basePath.startsWith('/orders/')) {
      return (
        <OrdersPage
          onNavigate={handleNavigate}
          inspectOrderId={searchParams.get('inspect') || searchParams.get('orderId') || undefined}
          initialStatus={searchParams.get('status') || undefined}
          initialFilter={searchParams.get('filter') || undefined}
        />
      );
    }
    if (basePath === '/payments') {
      if (currentUser.role === 'salesperson') {
        return <CollectionsPage onNavigate={handleNavigate} />;
      }
      return (
        <PaymentsPage
          onNavigate={handleNavigate}
          initialAging={searchParams.get('aging') || undefined}
          initialTab={(searchParams.get('tab') as 'receivables' | 'payments') || undefined}
        />
      );
    }

    // Fallback
    return currentUser.role === 'admin' ? (
      <AdminDashboard onNavigate={handleNavigate} />
    ) : (
      <SalesDashboard onNavigate={handleNavigate} />
    );
  };

  return (
    <div className="app-shell flex h-screen h-[100dvh] bg-background text-foreground overflow-hidden font-sans">
      {/* 1. Left Persistent Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        {/* Top Header */}
        <Header onNavigate={handleNavigate} />

        {/* Dynamic Page Body with smooth scroll and bottom padding for fixed mobile nav */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-28 md:pb-0 bg-background">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Loading page...</span>
            </div>
          }>
            {renderPage()}
          </Suspense>
        </main>
      </div>

      {/* 3. Mobile Persistent Bottom Tab Bar */}
      <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />

      {/* 4. Global Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        <RecordPaymentModal />
        <CreateOrderWizardModal />
        <AddCustomerModal />
        <EditCustomerModal />
        <AddManufacturerModal />
        <ShareLookbookModal />
        <DemoWalkthroughModal onNavigate={handleNavigate} />
      </Suspense>

      {/* 5. Global Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-22 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl sm:rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-between sm:justify-start gap-2.5 max-w-sm sm:max-w-md mx-auto sm:mx-0 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SoleFlow App ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white font-sans text-center">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/30"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ViewModeProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </ViewModeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
