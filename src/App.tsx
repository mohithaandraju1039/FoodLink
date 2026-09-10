import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ActAsBanner } from './components/layout/ActAsBanner';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-surface-app text-content-main font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200">
              <ActAsBanner />
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

export default App;
