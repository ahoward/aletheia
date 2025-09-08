/**
 * Main layout wrapper for Aletheia application
 */

'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '@/components/UI/NotificationContainer';
import { useUIStore } from '@/store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarOpen, theme } = useUIStore();

  return (
    <div className={`min-h-screen bg-gray-950 ${theme}`}>
      {/* Header */}
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Notification container */}
      <NotificationContainer />
    </div>
  );
};