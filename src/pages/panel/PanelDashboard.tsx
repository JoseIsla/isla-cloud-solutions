import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, newsApi, servicesApi, clientsApi, casesApi, type ContactFromAPI } from '@/lib/api';
import { FileText, Newspaper, MessageSquare, Eye, Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const PanelDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ services: 0, news: 0, contacts: 0, unread: 0, clients: 0, cases: 0 });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      servicesApi.list().catch(() => []),
      newsApi.list(token).catch(() => []),
      contactsApi.list(token).catch(() => []),
      clientsApi.list().catch(() => []),
      casesApi.list(token).catch(() => []),
    ]).then(([services, news, contacts, clients, cases]) => {
      setStats({
        services: services.length,
        news: news.length,
        contacts: contacts.length,
        unread: (contacts as ContactFromAPI[]).filter(c => !c.is_read).length,
        clients: clients.length,
        cases: cases.length,
      });
    });
  }, [token]);

  const cards = [
    { label: 'Servicios', value: stats.services, icon: FileText, color: 'text-primary', link: '/panel/servicios' },
    { label: 'Clientes', value: stats.clients, icon: Users, color: 'text-accent', link: '/panel/clientes' },
    { label: 'Casos de Éxito', value: stats.cases, icon: Trophy, color: 'text-primary', link: '/panel/casos' },
    { label: 'Noticias', value: stats.news, icon: Newspaper, color: 'text-primary', link: '/panel/noticias' },
    { label: 'Contactos', value: stats.contacts, icon: MessageSquare, color: 'text-primary', link: '/panel/contactos' },
    { label: 'Sin leer', value: stats.unread, icon: Eye, color: 'text-destructive', link: '/panel/contactos' },
  ];

  return (
    <PanelLayout>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <Icon size={18} className={card.color} />
              </div>
              <p className="text-2xl font-heading font-bold text-card-foreground">{card.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Panel de Administración</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Gestiona todos los contenidos dinámicos de la web de Isla Cloud Solutions desde aquí.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>📝 <strong className="text-foreground">Textos del Landing</strong> — Hero, intro, servicios, contadores, CTA y footer.</li>
            <li>📄 <strong className="text-foreground">Servicios</strong> — Añadir, editar o eliminar servicios.</li>
            <li>🏢 <strong className="text-foreground">Clientes</strong> — Logos del carrusel de clientes.</li>
            <li>🏆 <strong className="text-foreground">Casos de Éxito</strong> — Historias de éxito con clientes.</li>
            <li>📰 <strong className="text-foreground">Noticias</strong> — Blog con editor enriquecido.</li>
            <li>💬 <strong className="text-foreground">Contactos</strong> — Formularios de contacto recibidos.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Editar textos', to: '/panel/contenidos', icon: '📝' },
              { label: 'Gestionar servicios', to: '/panel/servicios', icon: '📄' },
              { label: 'Ver contactos', to: '/panel/contactos', icon: '💬' },
              { label: 'Publicar noticia', to: '/panel/noticias', icon: '📰' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-sm font-medium text-foreground"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelDashboard;
