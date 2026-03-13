import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, newsApi, servicesApi, clientsApi, type ContactFromAPI } from '@/lib/api';
import { FileText, Newspaper, MessageSquare, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const PanelDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ services: 0, news: 0, contacts: 0, unread: 0, clients: 0 });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      servicesApi.list().catch(() => []),
      newsApi.list(token).catch(() => []),
      contactsApi.list(token).catch(() => []),
      clientsApi.list().catch(() => []),
    ]).then(([services, news, contacts, clients]) => {
      setStats({
        services: services.length,
        news: news.length,
        contacts: contacts.length,
        unread: (contacts as ContactFromAPI[]).filter(c => !c.is_read).length,
        clients: clients.length,
      });
    });
  }, [token]);

  const cards = [
    { label: 'Servicios', value: stats.services, icon: FileText, color: 'text-primary', link: '/panel/servicios' },
    { label: 'Clientes', value: stats.clients, icon: Users, color: 'text-accent', link: '/panel/clientes' },
    { label: 'Noticias', value: stats.news, icon: Newspaper, color: 'text-primary', link: '/panel/noticias' },
    { label: 'Contactos', value: stats.contacts, icon: MessageSquare, color: 'text-primary', link: '/panel/contactos' },
    { label: 'Sin leer', value: stats.unread, icon: Eye, color: 'text-destructive', link: '/panel/contactos' },
  ];

  return (
    <PanelLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon size={20} className={card.color} />
              </div>
              <p className="text-3xl font-heading font-bold text-card-foreground">{card.value}</p>
            </Link>
          );
        })}
      </div>
      <div className="p-8 rounded-2xl bg-card border border-border">
        <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Bienvenido al Panel de Administración</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Desde aquí puedes gestionar todos los contenidos dinámicos de la web de Isla Cloud Solutions:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>📄 <strong className="text-foreground">Servicios</strong> — Añadir, editar o eliminar servicios con iconos, imágenes y descripciones.</li>
          <li>🏢 <strong className="text-foreground">Clientes</strong> — Gestionar la lista de clientes con logos que aparecen en el landing.</li>
          <li>📰 <strong className="text-foreground">Noticias</strong> — Publicar y gestionar noticias del blog con editor enriquecido.</li>
          <li>💬 <strong className="text-foreground">Contactos</strong> — Ver y gestionar los formularios de contacto recibidos.</li>
          <li>⚙️ <strong className="text-foreground">Contenidos</strong> — Editar textos del landing: hero, secciones, CTA, footer, etc.</li>
        </ul>
      </div>
    </PanelLayout>
  );
};

export default PanelDashboard;
