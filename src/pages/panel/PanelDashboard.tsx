import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, newsApi, servicesApi, clientsApi, casesApi, testimonialsApi, faqsApi, type ContactFromAPI } from '@/lib/api';
import {
  FileText, Newspaper, MessageSquare, Users, Trophy, MessageCircle,
  ArrowUpRight, Pencil, TrendingUp, AlertCircle, HelpCircle, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PanelDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    services: 0, news: 0, contacts: 0, unread: 0,
    clients: 0, cases: 0, testimonials: 0, faqs: 0,
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
      faqsApi.listAll(token).catch(() => []),
    ]).then(([services, news, contacts, clients, cases, testimonials, faqs]) => {
      setStats({
        services: services.length,
        news: news.length,
        contacts: contacts.length,
        unread: (contacts as ContactFromAPI[]).filter(c => !c.is_read).length,
        clients: clients.length,
        cases: cases.length,
        testimonials: testimonials.length,
        faqs: faqs.length,
      });
      setLoading(false);
    });
  }, [token]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  const primaryStats = [
    { label: 'Servicios', value: stats.services, icon: FileText, href: '/panel/servicios', color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Noticias', value: stats.news, icon: Newspaper, href: '/panel/noticias', color: 'bg-sky-500/10 text-sky-500' },
    { label: 'Contactos', value: stats.contacts, icon: MessageSquare, href: '/panel/contactos', color: 'bg-rose-500/10 text-rose-500', badge: stats.unread > 0 ? stats.unread : undefined },
  ];

  const secondaryStats = [
    { label: 'Clientes', value: stats.clients, icon: Users, href: '/panel/clientes', color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Casos de Éxito', value: stats.cases, icon: Trophy, href: '/panel/casos', color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Testimonios', value: stats.testimonials, icon: MessageCircle, href: '/panel/testimonios', color: 'bg-violet-500/10 text-violet-500' },
    { label: 'FAQs', value: stats.faqs, icon: HelpCircle, href: '/panel/faqs', color: 'bg-teal-500/10 text-teal-500' },
  ];

  const quickActions = [
    { label: 'Editar textos del landing', desc: 'Títulos, subtítulos, CTAs e imágenes', to: '/panel/contenidos', icon: Pencil },
    { label: 'Gestionar servicios', desc: 'Añadir, editar o reordenar', to: '/panel/servicios', icon: FileText },
    { label: 'Publicar noticia', desc: 'Crear artículo para el blog', to: '/panel/noticias', icon: Newspaper },
    { label: 'Ver contactos', desc: 'Mensajes del formulario web', to: '/panel/contactos', icon: MessageSquare },
  ];

  const StatCard = ({ card, large }: { card: { label: string; value: number; icon: any; href: string; color: string; badge?: number }, large?: boolean }) => {
    const Icon = card.icon;
    return (
      <Link
        to={card.href}
        className="group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
          {card.badge && (
            <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-pulse">
              {card.badge} nuevo{card.badge > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className={`${large ? 'text-3xl' : 'text-2xl'} font-heading font-bold text-foreground ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '—' : card.value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {card.label}
        </p>
        <ArrowUpRight size={14} className="absolute top-4 right-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
      </Link>
    );
  };

  return (
    <PanelLayout>
      <div className="space-y-8">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--navy))] p-6 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-primary/80 text-sm font-medium mb-1">{greeting}</p>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white">
              {user?.name || 'Administrador'}
            </h2>
            <p className="text-white/40 text-sm mt-2 flex items-center gap-2">
              <Clock size={13} />
              {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Unread alert */}
        {stats.unread > 0 && (
          <Link
            to="/panel/contactos"
            className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/15 hover:bg-destructive/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {stats.unread} {stats.unread === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}
              </p>
              <p className="text-xs text-muted-foreground">Revisa los formularios de contacto pendientes</p>
            </div>
            <ArrowUpRight size={16} className="text-destructive shrink-0" />
          </Link>
        )}

        {/* Primary stats */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3 px-1">
            Métricas principales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {primaryStats.map((card) => (
              <StatCard key={card.label} card={card} large />
            ))}
          </div>
        </div>

        {/* Secondary stats */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3 px-1">
            Contenido web
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {secondaryStats.map((card) => (
              <StatCard key={card.label} card={card} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3 px-1">
            Accesos rápidos
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
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tip card */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Guía rápida</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Los cambios realizados desde el panel se reflejan en la web pública de forma inmediata. Usa la sección
                <Link to="/panel/contenidos" className="text-primary hover:underline mx-1">Textos del Landing</Link>
                para personalizar todos los textos, imágenes y la navegación de tu sitio web.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelDashboard;
