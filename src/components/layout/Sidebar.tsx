import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Timer, Dumbbell, BarChart3, ListChecks, LogOut, Moon, Sun, Waves, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut, user } = useAuthStore();
  const { mode, toggle } = useThemeStore();
  const isCoach = user?.role === 'coach';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/trainings', label: isCoach ? 'Sesiones' : 'Entrenamientos', icon: Dumbbell, show: true },
    { to: '/stopwatch', label: 'Cronómetro', icon: Timer, show: true },
    { to: '/stats', label: 'Estadísticas', icon: BarChart3, show: true },
    { to: '/swim-tests', label: 'Pruebas', icon: ListChecks, show: true },
  ];

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
    }`;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                <Waves size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">NatacionApp</h1>
                <p className="text-xs text-gray-500">{isCoach ? 'Entrenador' : 'Nadador'}</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.filter((item) => item.show).map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClasses} onClick={onClose} end={item.to === '/'}>
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all w-full">
              <LogOut size={20} />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
