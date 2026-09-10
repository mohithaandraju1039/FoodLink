import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { ThemeSelector } from '../theme/ThemeSelector';
import { LanguageSelector } from '../theme/LanguageSelector';
import { UserRole } from '../../types';
import {
  Utensils,
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Truck,
  Shield,
  LogOut,
  User,
  Eye,
  Menu,
  X,
  FileText,
  Users,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, effectiveRole, actAsRole, setActAsRole, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Compute navigation links based on user role and admin preview mode
  const getNavLinks = () => {
    if (!isAuthenticated) return [];

    const role = effectiveRole;

    if (role === 'DONOR') {
      return [
        { label: t('nav_donor'), path: '/donor', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: t('donor_create_title'), path: '/donor/create', icon: <PlusCircle className="w-4 h-4" /> },
        { label: t('donor_my_donations'), path: '/donor/donations', icon: <Utensils className="w-4 h-4" /> },
      ];
    }

    if (role === 'RECEIVER') {
      return [
        { label: t('nav_receiver'), path: '/receiver', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: t('receiver_available_title'), path: '/receiver/available', icon: <Utensils className="w-4 h-4" /> },
        { label: t('receiver_my_claims'), path: '/receiver/claims', icon: <ShoppingBag className="w-4 h-4" /> },
      ];
    }

    if (role === 'VOLUNTEER') {
      return [
        { label: t('nav_volunteer'), path: '/volunteer', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: t('volunteer_available_tasks'), path: '/volunteer/tasks', icon: <Truck className="w-4 h-4" /> },
        { label: t('volunteer_my_deliveries'), path: '/volunteer/deliveries', icon: <Utensils className="w-4 h-4" /> },
      ];
    }

    if (user?.role === 'ADMIN') {
      return [
        { label: t('nav_admin'), path: '/admin', icon: <Shield className="w-4 h-4" /> },
        { label: 'Food Listings', path: '/admin/listings', icon: <Utensils className="w-4 h-4" /> },
        { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Claims', path: '/admin/claims', icon: <ShoppingBag className="w-4 h-4" /> },
        { label: 'Tasks', path: '/admin/tasks', icon: <Truck className="w-4 h-4" /> },
        { label: t('admin_audit_logs'), path: '/admin/audit', icon: <FileText className="w-4 h-4" /> },
        { label: t('admin_settings'), path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-surface-card/90 backdrop-blur-md border-b border-surface-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-content-main">
                  Food<span className="text-brand-600">Link</span>
                </span>
                <span className="text-[10px] font-semibold text-content-muted -mt-1 hidden sm:inline">
                  {t('tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                        : 'text-content-muted hover:text-content-main hover:bg-surface-hover'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Admin "View As Role" Preview Switcher */}
            {user?.role === 'ADMIN' && (
              <div className="relative group">
                <button
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    actAsRole
                      ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                      : 'border-surface-border text-content-muted hover:text-content-main bg-surface-card'
                  }`}
                >
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>{actAsRole ? `View: ${actAsRole}` : t('nav_view_as')}</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface-card border border-surface-border rounded-xl shadow-xl p-2 hidden group-hover:block z-50">
                  <div className="text-[11px] font-semibold text-content-muted px-2 py-1 uppercase tracking-wider">
                    {t('nav_view_as')}
                  </div>
                  <button
                    onClick={() => {
                      setActAsRole(null);
                      navigate('/admin');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      !actAsRole ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface-hover text-content-main'
                    }`}
                  >
                    Full Admin View
                  </button>

                  {(['DONOR', 'RECEIVER', 'VOLUNTEER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setActAsRole(r);
                        navigate(`/${r.toLowerCase()}`);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                        actAsRole === r ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-surface-hover text-content-main'
                      }`}
                    >
                      View {r.charAt(0) + r.slice(1).toLowerCase()} Portal
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Profile & Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-surface-border">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-content-main line-clamp-1">{user?.name}</span>
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title={t('nav_logout')}
                  className="p-2 rounded-xl border border-surface-border text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-content-main hover:bg-surface-hover rounded-xl transition-colors"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-colors"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-surface-border text-content-main hover:bg-surface-hover"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-surface-border bg-surface-card px-4 pt-2 pb-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <LanguageSelector />
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-bold text-rose-600"
              >
                <LogOut className="w-4 h-4" /> {t('nav_logout')}
              </button>
            )}
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-content-main hover:bg-surface-hover"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
