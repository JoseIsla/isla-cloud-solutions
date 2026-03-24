import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Newspaper, MessageSquare,
  LogOut, Menu, X, Users, Trophy, Globe, Pencil, MessageCircle,
  ChevronLeft, HelpCircle,
} from 'lucide-react';
import logotipoBlanco from '@/assets/logos/logotipo-blanco-small.png';
import isotipoLogo from '@/assets/logos/isotipo.png';

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
      { label: 'Testimonios', path: '/panel/testimonios', icon: MessageCircle },
      { label: 'FAQs', path: '/panel/faqs', icon: HelpCircle },
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
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';
  const mainMargin = collapsed ? 'lg:ml-[72px]' : 'lg:ml-64';

  const currentPage = allLinks.find(l => l.path === location.pathname);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-[hsl(var(--navy))] transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`border-b border-white/[0.06] flex items-center ${collapsed ? 'justify-center p-4 h-16' : 'p-5 h-16'}`}>
            {collapsed ? (
              <img src={isotipoLogo} alt="ICS" className="h-8 w-8 object-contain" />
            ) : (
              <div className="flex items-center gap-3 w-full">
                <img src={logotipoBlanco} alt="Isla Cloud Solutions" className="h-7 object-contain" />
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-4' : 'px-3 py-4'} space-y-6`}>
            {sidebarSections.map((section) => (
              <div key={section.label}>
                {!collapsed && (
                  <span className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 block mb-2">
                    {section.label}
                  </span>
                )}
                <div className="space-y-0.5">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setSidebarOpen(false)}
                        title={collapsed ? link.label : undefined}
                        className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-primary/15 text-primary shadow-sm shadow-primary/5'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon size={collapsed ? 20 : 16} className={`shrink-0 ${isActive ? '' : 'group-hover:scale-105 transition-transform'}`} />
                        {!collapsed && <span className="truncate">{link.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div className={`border-t border-white/[0.06] ${collapsed ? 'p-2' : 'p-3'} space-y-0.5`}>
            {!collapsed && (
              <div className="px-3 py-2 mb-2">
                <p className="text-white/30 text-[11px] truncate">{user?.email}</p>
              </div>
            )}
            <Link
              to="/"
              target="_blank"
              title={collapsed ? 'Ver web pública' : undefined}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-lg text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors`}
            >
              <Globe size={16} />
              {!collapsed && <span>Ver web pública</span>}
            </Link>
            <button
              onClick={logout}
              title={collapsed ? 'Cerrar sesión' : undefined}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-lg text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors w-full`}
            >
              <LogOut size={16} />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
            {/* Collapse toggle - desktop only */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-full py-2 mt-1 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
            >
              <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className={`flex-1 ${mainMargin} transition-all duration-300`}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 h-16 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-3">
            {currentPage && (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${location.pathname === '/panel' ? 'bg-primary/10' : 'bg-muted'}`}>
                <currentPage.icon size={16} className={location.pathname === '/panel' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
            )}
            <div>
              <h1 className="font-heading font-semibold text-foreground text-[15px] leading-tight">
                {currentPage?.label || 'Panel'}
              </h1>
              <p className="text-muted-foreground text-[11px] hidden sm:block">
                Panel de Gestión · Isla Cloud Solutions
              </p>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
};

export default PanelLayout;
