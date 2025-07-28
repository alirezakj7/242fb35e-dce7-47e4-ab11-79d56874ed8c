import { ReactNode } from 'react';
import { MobileNavigation } from './MobileNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <MobileNavigation />
      
      {/* Main Content */}
      <div className="md:mr-64">
        <main className="pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}