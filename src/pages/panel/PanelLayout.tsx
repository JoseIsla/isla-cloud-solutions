import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Newspaper, MessageSquare,
  LogOut, Menu, X, Users, Trophy, PanelLeftOpen, Globe, Pencil,
} from 'lucide-react';
import logotipoBlanco from '@/assets/logos/logotipo-blanco-small.png';

const sidebarSections = [
  {
    label: 'General',
    links: [
      { label: 'Dashboard', path: '/panel', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Contenido Web',
    links: [
      { label: 'Textos del Landing', path: '/panel/contenidos', icon: Pencil },
      { label: 'Servicios', path: '/panel/servicios', icon: FileText },
      { label: 'Clientes', path: '/panel/clientes', icon: Users },
      { label: 'Casos de Éxito', path: '/panel/casos', icon: Trophy },
      { label: 'Noticias / Blog', path: '/panel/noticias', icon: Newspaper },
    ],
  },
  {
    label: 'Comunicación',
    links: [
      { label: 'Contactos', path: '/panel/contactos', icon: MessageSquare },
    ],
  },
];

const allLinks = sidebarSections.flatMap(s => s.links);

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-hero-foreground/10 flex flex-col items-center gap-3">
            <img src={logotipoBlanco} alt="Isla Cloud Solutions" className="h-8 object-contain" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Panel de Gestión</span>
            <p className="text-hero-foreground/50 text-xs">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
            {sidebarSections.map((section) => (
              <div key={section.label}>
                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-hero-foreground/30">
                  {section.label}
                </span>
                <div className="mt-2 space-y-0.5">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/15 text-primary'
                            : 'text-hero-foreground/60 hover:text-hero-foreground hover:bg-hero-foreground/5'
                        }`}
                      >
                        <Icon size={17} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-hero-foreground/10 space-y-1">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-hero-foreground/60 hover:text-hero-foreground transition-colors w-full"
            >
              <Globe size={17} />
              Ver web pública
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-hero-foreground/60 hover:text-destructive transition-colors w-full"
            >
              <LogOut size={17} />
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
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-foreground">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-heading font-semibold text-foreground">
            {allLinks.find(l => l.path === location.pathname)?.label || 'Panel'}
          </h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default PanelLayout;
