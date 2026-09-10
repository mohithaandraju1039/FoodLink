import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Utensils, Mail, Lock, UserCheck, KeyRound } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      // Redirect to appropriate dashboard
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DONOR') navigate('/donor');
      else if (user.role === 'RECEIVER') navigate('/receiver');
      else if (user.role === 'VOLUNTEER') navigate('/volunteer');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Sign-In shortcut for rapid manual & reviewer testing
  const handleDemoLogin = async (demoEmail: string, role: UserRole) => {
    setEmail(demoEmail);
    setPassword('FoodLink@2026');
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email: demoEmail, password: 'FoodLink@2026' });
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'DONOR') navigate('/donor');
      else if (role === 'RECEIVER') navigate('/receiver');
      else if (role === 'VOLUNTEER') navigate('/volunteer');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-card p-8 rounded-3xl border border-surface-border shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-600 text-white shadow-lg mb-2">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-content-main">
            {t('auth_login_title')}
          </h2>
          <p className="text-xs text-content-muted">{t('tagline')}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label={t('auth_email')}
            type="email"
            placeholder="you@organization.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label={t('auth_password')}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            {t('auth_login_btn')}
          </Button>
        </form>

        {/* Demo Accounts Quick-Click Bar */}
        <div className="pt-6 border-t border-surface-border space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-content-muted">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> {t('auth_demo_login')}
            </span>
            <span className="text-[10px] text-brand-600 font-normal">Pass: FoodLink@2026</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('admin@foodlink.org', 'ADMIN')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-hover hover:border-brand-500 font-semibold text-content-main text-left transition-all"
            >
              <div className="text-brand-600 font-bold">Admin</div>
              <div className="text-[10px] text-content-muted truncate">admin@foodlink.org</div>
            </button>

            <button
              onClick={() => handleDemoLogin('donor.spice@foodlink.org', 'DONOR')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-hover hover:border-brand-500 font-semibold text-content-main text-left transition-all"
            >
              <div className="text-emerald-600 font-bold">Donor</div>
              <div className="text-[10px] text-content-muted truncate">Annapurna Caterers</div>
            </button>

            <button
              onClick={() => handleDemoLogin('receiver.hope@foodlink.org', 'RECEIVER')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-hover hover:border-brand-500 font-semibold text-content-main text-left transition-all"
            >
              <div className="text-sky-600 font-bold">Receiver</div>
              <div className="text-[10px] text-content-muted truncate">Hope Orphanage NGO</div>
            </button>

            <button
              onClick={() => handleDemoLogin('volunteer.rahul@foodlink.org', 'VOLUNTEER')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-hover hover:border-brand-500 font-semibold text-content-main text-left transition-all"
            >
              <div className="text-purple-600 font-bold">Volunteer</div>
              <div className="text-[10px] text-content-muted truncate">Rahul Sharma</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-content-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            {t('auth_register_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
};
