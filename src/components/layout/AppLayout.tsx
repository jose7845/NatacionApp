import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 lg:hidden">
          <div className="flex items-center px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
              <Menu size={24} />
            </button>
            <h1 className="ml-3 font-bold text-lg">NatacionApp</h1>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
