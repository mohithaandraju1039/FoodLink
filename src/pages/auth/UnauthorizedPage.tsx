import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 mb-4 border border-rose-200 dark:border-rose-800">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-black text-content-main mb-2">Access Restricted</h2>
      <p className="text-xs text-content-muted max-w-md mb-6 leading-relaxed">
        You do not have the required role permissions to access this portal or resource. Please log in with an authorized account or switch to your assigned portal.
      </p>
      <Link to="/login">
        <Button icon={<ArrowLeft className="w-4 h-4" />}>Return to Login</Button>
      </Link>
    </div>
  );
};
