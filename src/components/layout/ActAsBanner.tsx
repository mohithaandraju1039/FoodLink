import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ActAsBanner: React.FC = () => {
  const { user, actAsRole, setActAsRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (user?.role !== 'ADMIN') return null;

  let previewRole = actAsRole;
  if (!previewRole) {
    if (location.pathname.startsWith('/donor')) previewRole = 'DONOR';
    else if (location.pathname.startsWith('/receiver')) previewRole = 'RECEIVER';
    else if (location.pathname.startsWith('/volunteer')) previewRole = 'VOLUNTEER';
  }

  if (!previewRole) return null;

  const handleExit = () => {
    setActAsRole(null);
    navigate('/admin');
  };

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner z-50">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <ShieldAlert className="w-4 h-4 shrink-0 text-slate-950" />
        <span>
          ADMIN PORTAL PREVIEW: You are currently viewing the <span className="uppercase tracking-wider font-extrabold underline">{previewRole} PORTAL</span>. Your actual account role remains ADMIN.
        </span>
      </div>

      <button
        onClick={handleExit}
        className="px-3 py-1 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin Portal
      </button>
    </div>
  );
};
