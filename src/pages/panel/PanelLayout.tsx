import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Newspaper, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', path: '/panel', icon: LayoutDashboard },
  { label: 'Servicios', path: '/panel/servicios', icon: FileText },
  { label: 'Noticias', path: '/panel/noticias', icon: Newspaper },
  { label: 'Contactos', path: '/panel/contactos', icon: MessageSquare },
  { label: 'Contenidos', path: '/panel/contenidos', icon: Settings },
];

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-hero-foreground/10">
            <h2 className="font-heading font-bold text-hero-foreground text-lg">
              Isla Cloud <span className="text-primary">Panel</span>
            </h2>
            <p className="text-hero-foreground/50 text-xs mt-1">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-hero-foreground/60 hover:text-hero-foreground hover:bg-hero-foreground/5'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-hero-foreground/10">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-hero-foreground/60 hover:text-destructive transition-colors w-full"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-foreground">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-heading font-semibold text-foreground">
            {sidebarLinks.find(l => l.path === location.pathname)?.label || 'Panel'}
          </h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default PanelLayout;
