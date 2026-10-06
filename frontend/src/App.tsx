import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { AppProvider, useApp } from './context/AppContext';
import { RequireAuth, RequireRole } from './auth/RouteGuards';
import { useRealtimeSubscriptions } from './hooks/useRealtime';
import { useDesignsRealtime } from './hooks/useDesignsRealtime';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CustomersPage } from './pages/customers/CustomersPage';
import { DesignsPage } from './pages/designs/DesignsPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { SalesTeamPage } from './pages/sales/SalesTeamPage';
import { ManufacturersPage } from './pages/manufacturers/ManufacturersPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { SalesDashboard } from './pages/sales/SalesDashboard';
import { FollowUpsPage } from './pages/sales/FollowUpsPage';
import { VisitsPage } from './pages/sales/VisitsPage';
import { CollectionsPage } from './pages/sales/CollectionsPage';
import { ReceiptPage } from './pages/payments/ReceiptPage';
import { LoginPage } from './pages/login/LoginPage';
import { LandingPage } from './pages/landing/LandingPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PublicLookbookPage } from './pages/public/PublicLookbookPage';
import {
  TotalCustomersInsightPage,
  TotalReceivablesInsightPage,
  OverdueAccountsInsightPage,
  ClearedAccountsInsightPage,
} from './pages/customers/insights';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';
import { CreateOrderWizardModal } from './components/orders/CreateOrderWizardModal';
import { AddCustomerModal } from './components/customers/AddCustomerModal';
import { ShareLookbookModal } from './components/designs/ShareLookbookModal';
import { DemoWalkthroughModal } from './components/demo/DemoWalkthroughModal';
import { PlatformAdminPage } from './pages/admin/PlatformAdminPage';
import { AccountsPage } from './pages/platform/AccountsPage';
import { ViewModeProvider } from './context/ViewModeContext';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CheckCircle2, AlertCircle } from 'lucide-react';


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
    isLoggedIn,
    toastMessage,
    showToast,
    setIsMobileSidebarOpen,
    isDarkMode,
  } = useApp();

  const { user: authUser, role: authRole } = useAuth();

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

  // Live Supabase Realtime subscriptions for orders and notifications
  useRealtimeSubscriptions(authUser?.id, (msg) => {
    showToast(msg);
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
      <PublicLookbookPage
        shareToken={activeShareToken || 'token-abc-001'}
        onReturnToApp={() => {
          window.location.hash = '#login';
          setUnauthView('login');
        }}
      />
    );
  }

  // 2. Forgot / Reset Password
  if (unauthView === 'forgot_password') {
    return (
      <ForgotPasswordPage
        onBackToLogin={() => {
          window.location.hash = '#login';
          setUnauthView('login');
        }}
      />
    );
  }

  if (unauthView === 'reset_password') {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          window.location.hash = '#login';
          setUnauthView('login');
        }}
      />
    );
  }

  // 3. Public Landing Page (Default for root URL /)
  if (unauthView === 'landing') {
    return (
      <LandingPage
        isAlreadyLoggedIn={isLoggedIn}
        onReturnToDashboard={() => {
          const targetPath = currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
          setCurrentPath(targetPath);
          setUnauthView('app');
          window.location.hash = '#app';
        }}
        onLoginSuccess={(role) => {
          setIsMobileSidebarOpen(false);
          const targetPath = role === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
          setCurrentPath(targetPath);
          setUnauthView('app');
          window.location.hash = '#app';
        }}
        onNavigateToLogin={(mode = 'login') => {
          window.location.hash = mode;
          setUnauthView(mode);
        }}
      />
    );
  }

  // 4. Login / Signup Page
  if (unauthView === 'login' || unauthView === 'signup' || !isLoggedIn) {
    return (
      <LoginPage
        initialMode={unauthView === 'signup' ? 'signup' : 'login'}
        onSuccess={(role) => {
          setIsMobileSidebarOpen(false);
          const targetPath = role === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
          setCurrentPath(targetPath);
          setUnauthView('app');
          window.location.hash = '#app';
        }}
        onBackToLanding={() => {
          window.location.hash = '#landing';
          setUnauthView('landing');
        }}
        onForgotPassword={() => {
          window.location.hash = '#auth/forgot-password';
          setUnauthView('forgot_password');
        }}
      />
    );
  }

  // 3. Authenticated Page Content based on currentPath
  const renderPage = () => {
    // Public Landing Page view for authenticated user
    if (currentPath === '/landing') {
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
    if (currentPath.includes('/customers/insights/total')) {
      return <TotalCustomersInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }
    if (currentPath.includes('/customers/insights/receivables')) {
      return <TotalReceivablesInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }
    if (currentPath.includes('/customers/insights/overdue')) {
      return <OverdueAccountsInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }
    if (currentPath.includes('/customers/insights/cleared')) {
      return <ClearedAccountsInsightPage onNavigate={handleNavigate} fromPath={getFromPath(currentPath)} />;
    }

    // Platform Accounts route (Super Admin All Accounts Overview)
    if (currentPath === '/platform/accounts' || currentPath === '/admin/accounts') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/admin/dashboard')}>
          <AccountsPage onNavigate={handleNavigate} />
        </RequireRole>
      );
    }

    // Platform Admin route (Super Admin Console)
    if (currentPath === '/platform' || currentPath === '/admin/platform') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/admin/dashboard')}>
          <PlatformAdminPage />
        </RequireRole>
      );
    }

    // Admin routes guarded by RequireRole
    if (currentPath === '/admin/dashboard') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <AdminDashboard onNavigate={handleNavigate} />
        </RequireRole>
      );
    }

    if (currentPath === '/admin/customers' || currentPath.startsWith('/admin/customers/')) {
      const match = currentPath.match(/\/admin\/customers\/([^?#/]+)/);
      const customerId = match && match[1] !== 'insights' ? match[1] : undefined;
      return <CustomersPage onNavigate={handleNavigate} customerId={customerId} fromPath="/admin/customers" />;
    }
    if (currentPath === '/admin/designs') {
      return <DesignsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/orders' || currentPath.startsWith('/admin/orders/')) {
      return <OrdersPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/sales-team') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <SalesTeamPage onNavigate={handleNavigate} />
        </RequireRole>
      );
    }
    if (currentPath === '/admin/manufacturers') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <ManufacturersPage onNavigate={handleNavigate} />
        </RequireRole>
      );
    }
    if (currentPath === '/admin/payments') {
      return <PaymentsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/reports') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <ReportsPage />
        </RequireRole>
      );
    }
    if (currentPath === '/admin/settings') {
      return (
        <RequireRole role="admin" onReturnHome={() => setCurrentPath('/sales/dashboard')}>
          <SettingsPage />
        </RequireRole>
      );
    }
    if (currentPath === '/admin/notifications') {
      return <NotificationsPage />;
    }

    // Sales routes
    if (currentPath === '/sales/dashboard') {
      return <SalesDashboard onNavigate={handleNavigate} />;
    }
    if (currentPath === '/sales/customers' || currentPath.startsWith('/sales/customers/')) {
      const match = currentPath.match(/\/sales\/customers\/([^?#/]+)/);
      const customerId = match && match[1] !== 'insights' ? match[1] : undefined;
      return <CustomersPage onNavigate={handleNavigate} customerId={customerId} fromPath="/sales/customers" />;
    }
    if (currentPath === '/sales/designs') {
      return <DesignsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/sales/orders') {
      return <OrdersPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/sales/collections') {
      return <CollectionsPage />;
    }
    if (currentPath === '/sales/follow-ups') {
      return <FollowUpsPage />;
    }
    if (currentPath === '/sales/visits') {
      return <VisitsPage />;
    }
    if (currentPath === '/sales/notifications') {
      return <NotificationsPage />;
    }
    if (currentPath === '/sales/activity') {
      return <SalesTeamPage onNavigate={handleNavigate} />;
    }
    if (currentPath.startsWith('/receipts/')) {
      const match = currentPath.match(/\/receipts\/([^?#/]+)/);
      const paymentId = match ? match[1] : undefined;
      return (
        <ReceiptPage
          paymentId={paymentId}
          onBack={() => handleNavigate(currentUser.role === 'admin' ? '/admin/payments' : '/sales/collections')}
        />
      );
    }

    if (currentPath === '/sales/profile') {
      return <SettingsPage />;
    }

    // Fallback
    return currentUser.role === 'admin' ? (
      <AdminDashboard onNavigate={handleNavigate} />
    ) : (
      <SalesDashboard onNavigate={handleNavigate} />
    );
  };

  return (
    <div className="app-shell flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* 1. Left Persistent Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Top Header */}
        <Header onNavigate={handleNavigate} />

        {/* Dynamic Page Body with smooth scroll */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-background">
          {renderPage()}
        </main>
      </div>

      {/* 3. Mobile Persistent Bottom Tab Bar */}
      <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />

      {/* 4. Global Modals */}
      <RecordPaymentModal />
      <CreateOrderWizardModal />
      <AddCustomerModal />
      <ShareLookbookModal />
      <DemoWalkthroughModal onNavigate={handleNavigate} />

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
