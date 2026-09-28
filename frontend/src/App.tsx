import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { SalesDashboard } from './pages/sales/SalesDashboard';
import { FollowUpsPage } from './pages/sales/FollowUpsPage';
import { VisitsPage } from './pages/sales/VisitsPage';
import { CollectionsPage } from './pages/sales/CollectionsPage';
import { LoginPage } from './pages/login/LoginPage';
import { LandingPage } from './pages/landing/LandingPage';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';
import { CreateOrderWizardModal } from './components/orders/CreateOrderWizardModal';
import { AddCustomerModal } from './components/customers/AddCustomerModal';
import { ShareLookbookModal } from './components/designs/ShareLookbookModal';
import { DemoWalkthroughModal } from './components/demo/DemoWalkthroughModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    toastMessage,
    showToast,
    setIsMobileSidebarOpen,
    isDarkMode,
  } = useApp();
  const [currentPath, setCurrentPath] = useState<string>(
    currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard'
  );

  const [unauthView, setUnauthView] = useState<'landing' | 'login' | 'signup'>('landing');

  // Handle URL hash routing for direct access like #login or #signup
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#login') {
        setUnauthView('login');
      } else if (window.location.hash === '#signup') {
        setUnauthView('signup');
      } else if (window.location.hash === '#landing' || window.location.hash === '#home') {
        setUnauthView('landing');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync route on role switch
  useEffect(() => {
    if (currentUser.role === 'admin' && currentPath.startsWith('/sales')) {
      setCurrentPath('/admin/dashboard');
    } else if (currentUser.role === 'salesperson' && currentPath.startsWith('/admin')) {
      setCurrentPath('/sales/dashboard');
    }
    setIsMobileSidebarOpen(false);
  }, [currentUser.role, setIsMobileSidebarOpen]);

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
      setCurrentPath('/sales/dashboard');
      return;
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoggedIn) {
    if (unauthView === 'login' || unauthView === 'signup') {
      return (
        <LoginPage
          initialMode={unauthView}
          onSuccess={(role) => {
            setIsMobileSidebarOpen(false);
            setCurrentPath(role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
          }}
          onBackToLanding={() => {
            window.location.hash = '';
            setUnauthView('landing');
          }}
        />
      );
    }

    return (
      <LandingPage
        onLoginSuccess={(role) => {
          setIsMobileSidebarOpen(false);
          setCurrentPath(role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
        }}
        onNavigateToLogin={(mode = 'login') => {
          window.location.hash = mode;
          setUnauthView(mode);
        }}
      />
    );
  }

  // Render Page Content based on currentPath
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
    // Admin routes
    if (currentPath === '/admin/dashboard') {
      return <AdminDashboard onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/customers' || currentPath.startsWith('/admin/customers/')) {
      return <CustomersPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/designs') {
      return <DesignsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/orders' || currentPath.startsWith('/admin/orders/')) {
      return <OrdersPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/sales-team') {
      return <SalesTeamPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/manufacturers') {
      return <ManufacturersPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/payments') {
      return <PaymentsPage onNavigate={handleNavigate} />;
    }
    if (currentPath === '/admin/reports') {
      return <ReportsPage />;
    }
    if (currentPath === '/admin/settings') {
      return <SettingsPage />;
    }
    if (currentPath === '/admin/notifications') {
      return <NotificationsPage />;
    }
    if (currentPath === '/admin/audit-log') {
      return <AuditLogPage />;
    }

    // Sales routes
    if (currentPath === '/sales/dashboard') {
      return <SalesDashboard onNavigate={handleNavigate} />;
    }
    if (currentPath === '/sales/customers') {
      return <CustomersPage onNavigate={handleNavigate} />;
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
    <div className={`app-shell flex h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans${isDarkMode ? ' dark-theme' : ''}`}>
      {/* 1. Left Persistent Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onNavigate={handleNavigate} />

        {/* Dynamic Page Body with smooth scroll */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
