import React from 'react';
import Header from './Header';
import Footer from './Footer';
import DiscordPopup from './DiscordPopup';
import ScrollToTop from './ScrollToTop';
import { Outlet, useLocation } from 'react-router-dom';

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <DiscordPopup />
      <Header />
      <main className="flex-grow" key={location.key}>
        <ScrollToTop />
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}