import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, newsApi, servicesApi, type ContactFromAPI } from '@/lib/api';
import { FileText, Newspaper, MessageSquare, Eye } from 'lucide-react';

const PanelDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ services: 0, news: 0, contacts: 0, unread: 0 });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      servicesApi.list().catch(() => []),
      newsApi.list(token).catch(() => []),
      contactsApi.list(token).catch(() => []),
    ]).then(([services, news, contacts]) => {
      setStats({
        services: services.length,
        news: news.length,
        contacts: contacts.length,
        unread: (contacts as ContactFromAPI[]).filter(c => !c.is_read).length,
      });
    });
  }, [token]);

  const cards = [
    { label: 'Servicios', value: stats.services, icon: FileText, color: 'text-primary' },
    { label: 'Noticias', value: stats.news, icon: Newspaper, color: 'text-accent' },
    { label: 'Contactos', value: stats.contacts, icon: MessageSquare, color: 'text-primary' },
    { label: 'Sin leer', value: stats.unread, icon: Eye, color: 'text-destructive' },
  ];

  return (
    <PanelLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon size={20} className={card.color} />
              </div>
              <p className="text-3xl font-heading font-bold text-card-foreground">{card.value}</p>
            </div>
          );
        })}
      </div>
      <div className="p-8 rounded-2xl bg-card border border-border">
        <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Bienvenido al Panel de Administración</h2>
        <p className="text-muted-foreground">
          Desde aquí puedes gestionar los servicios, noticias, formularios de contacto y contenidos de la web de Isla Cloud Solutions.
        </p>
      </div>
    </PanelLayout>
  );
};

export default PanelDashboard;
