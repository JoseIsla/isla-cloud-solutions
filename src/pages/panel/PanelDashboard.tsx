import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, newsApi, servicesApi, clientsApi, casesApi, testimonialsApi, type ContactFromAPI } from '@/lib/api';
import {
  FileText, Newspaper, MessageSquare, Users, Trophy, MessageCircle,
  ArrowUpRight, Pencil, TrendingUp, AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PanelDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    services: 0, news: 0, contacts: 0, unread: 0,
    clients: 0, cases: 0, testimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      servicesApi.list().catch(() => []),
      newsApi.list(token).catch(() => []),
      contactsApi.list(token).catch(() => []),
      clientsApi.list().catch(() => []),
      casesApi.list(token).catch(() => []),
      testimonialsApi.listAll(token).catch(() => []),
    ]).then(([services, news, contacts, clients, cases, testimonials]) => {
      setStats({
        services: services.length,
        news: news.length,
        contacts: contacts.length,
        unread: (contacts as ContactFromAPI[]).filter(c => !c.is_read).length,
        clients: clients.length,
        cases: cases.length,
        testimonials: testimonials.length,
      });
      setLoading(false);
    });
  }, [token]);

  const statCards = [
    { label: 'Servicios', value: stats.services, icon: FileText, href: '/panel/servicios', color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Clientes', value: stats.clients, icon: Users, href: '/panel/clientes', color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Casos de Éxito', value: stats.cases, icon: Trophy, href: '/panel/casos', color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Testimonios', value: stats.testimonials, icon: MessageCircle, href: '/panel/testimonios', color: 'bg-violet-500/10 text-violet-500' },
    { label: 'Noticias', value: stats.news, icon: Newspaper, href: '/panel/noticias', color: 'bg-sky-500/10 text-sky-500' },
    { label: 'Contactos', value: stats.contacts, icon: MessageSquare, href: '/panel/contactos', color: 'bg-rose-500/10 text-rose-500' },
  ];

  const quickActions = [
    { label: 'Editar textos del landing', desc: 'Títulos, subtítulos y CTAs', to: '/panel/contenidos', icon: Pencil, color: 'text-primary' },
    { label: 'Gestionar servicios', desc: 'Añadir, editar o eliminar', to: '/panel/servicios', icon: FileText, color: 'text-blue-500' },
    { label: 'Publicar noticia', desc: 'Crear artículo para el blog', to: '/panel/noticias', icon: Newspaper, color: 'text-sky-500' },
    { label: 'Ver contactos', desc: 'Mensajes del formulario', to: '/panel/contactos', icon: MessageSquare, color: 'text-rose-500' },
  ];

  return (
    <PanelLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Bienvenido{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Resumen general de tu web y accesos rápidos.
          </p>
        </div>

        {/* Unread alert */}
        {stats.unread > 0 && (
          <Link
            to="/panel/contactos"
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {stats.unread} {stats.unread === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}
              </p>
              <p className="text-xs text-muted-foreground">Revisa los formularios de contacto pendientes</p>
            </div>
            <ArrowUpRight size={16} className="text-primary shrink-0" />
          </Link>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.href}
                className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.03] transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <Icon size={18} />
                </div>
                <p className={`text-2xl font-heading font-bold text-foreground ${loading ? 'animate-pulse' : ''}`}>
                  {loading ? '—' : card.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                  {card.label}
                </p>
                <ArrowUpRight size={14} className="absolute top-3 right-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon size={18} className={`${item.color} transition-colors`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info card */}
        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp size={18} className="text-muted-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Guía del panel</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Desde aquí puedes gestionar todos los contenidos de la web: textos, imágenes del hero, servicios, clientes, casos de éxito, testimonios, noticias y contactos. Los cambios se reflejan en la web pública de forma inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelDashboard;
