import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Utensils, Mail, Lock, User, Phone, Building, MapPin, ArrowLeft, Heart, Truck, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Step 1: Role Selection; Step 2: Form Details
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>('DONOR');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !phone || !city) {
      setError('Please fill in all mandatory registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        organization: organization || undefined,
        city,
      });

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DONOR') navigate('/donor');
      else if (user.role === 'RECEIVER') navigate('/receiver');
      else if (user.role === 'VOLUNTEER') navigate('/volunteer');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'DONOR',
      title: 'Food Donor',
      desc: 'Restaurants, hotels, caterers, households, or businesses donating surplus food.',
      icon: <Utensils className="w-8 h-8" />,
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
    },
    {
      role: 'RECEIVER',
      title: 'Food Receiver (NGO / Shelter)',
      desc: 'NGOs, orphanages, community kitchens, and shelters receiving surplus food.',
      icon: <Heart className="w-8 h-8" />,
      color: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300',
    },
    {
      role: 'VOLUNTEER',
      title: 'Delivery Volunteer',
      desc: 'Individuals and volunteers who transport food from donors to receivers.',
      icon: <Truck className="w-8 h-8" />,
      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-surface-card p-8 rounded-3xl border border-surface-border shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-600 text-white shadow-lg mb-1">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-content-main">
            {step === 1 ? 'What type of FoodLink account do you want to create?' : `Register as ${role}`}
          </h2>
          <p className="text-xs text-content-muted">
            {step === 1
              ? 'Select your role to get started with zero food waste and zero hunger.'
              : `Step 2 of 2: Enter your ${role.toLowerCase()} account details.`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] hover:shadow-md flex items-start gap-4 ${item.color}`}
                >
                  <div className="p-2.5 rounded-xl bg-surface-card shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-content-main">{item.title}</h3>
                      <span className="text-xs font-bold text-brand-600 hover:underline">Select &rarr;</span>
                    </div>
                    <p className="text-xs text-content-muted mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center text-xs text-content-muted pt-4 border-t border-surface-border">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                {t('auth_login_btn')}
              </Link>
            </div>
          </div>
        ) : (
          /* STEP 2: REGISTRATION DETAILS FORM */
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-hover border border-surface-border mb-2">
              <span className="text-xs font-bold text-content-main">
                Selected Account Type: <span className="text-brand-600 uppercase">{role}</span>
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Role
              </button>
            </div>

            <Input
              label={t('auth_name')}
              placeholder={role === 'DONOR' ? 'Annapurna Hotel / John Doe' : 'Hope Orphanage / Rahul Patel'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label={t('auth_email')}
              type="email"
              placeholder="contact@domain.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t('auth_password')}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t('auth_phone')}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                required
              />
              <Input
                label={t('auth_city')}
                placeholder="Hyderabad / Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                icon={<MapPin className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label={t('auth_organization')}
              placeholder="Foundation / Business Entity (Optional)"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              icon={<Building className="w-4 h-4" />}
            />

            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Create {role} Account
            </Button>

            <div className="text-center text-xs text-content-muted pt-2 border-t border-surface-border">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                {t('auth_login_btn')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
