import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, type ContactFromAPI } from '@/lib/api';
import { Trash2, Mail, MailOpen, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PanelContactos = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<ContactFromAPI[]>([]);
  const [selected, setSelected] = useState<ContactFromAPI | null>(null);

  const load = () => { if (token) contactsApi.list(token).then(setContacts).catch(() => {}); };
  useEffect(load, [token]);

  const markRead = async (c: ContactFromAPI) => {
    if (!token) return;
    try {
      await contactsApi.markRead(c.id, token);
      setSelected({ ...c, is_read: 1 });
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('¿Eliminar este contacto?')) return;
    try {
      await contactsApi.delete(id, token);
      toast.success('Contacto eliminado');
      if (selected?.id === id) setSelected(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const unreadCount = contacts.filter(c => !c.is_read).length;

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Contactos</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {contacts.length} mensajes · {unreadCount > 0 && <span className="text-primary font-medium">{unreadCount} sin leer</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* List */}
          <div className="lg:col-span-2 rounded-xl bg-card border border-border overflow-hidden max-h-[70vh] overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">No hay mensajes</div>
            ) : contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); if (!c.is_read) markRead(c); }}
                className={`w-full text-left p-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                  selected?.id === c.id ? 'bg-primary/[0.04]' : ''
                } ${!c.is_read ? 'bg-primary/[0.02]' : ''}`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  {c.is_read ? (
                    <MailOpen size={14} className="text-muted-foreground/50 shrink-0" />
                  ) : (
                    <div className="relative shrink-0">
                      <Mail size={14} className="text-primary" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                    </div>
                  )}
                  <span className={`text-sm font-medium truncate ${c.is_read ? 'text-foreground' : 'text-primary'}`}>
                    {c.nombre}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate pl-6">{c.mensaje}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 mt-1.5 pl-6">
                  <Clock size={9} />
                  {new Date(c.created_at).toLocaleDateString('es-ES')}
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3 rounded-xl bg-card border border-border p-6 min-h-[300px]">
            {selected ? (
              <div>
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">{selected.nombre}</h3>
                    <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
                  </div>
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {selected.empresa && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-20 shrink-0">Empresa</span>
                      <span className="text-foreground">{selected.empresa}</span>
                    </div>
                  )}
                  {selected.telefono && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-20 shrink-0">Teléfono</span>
                      <span className="text-foreground">{selected.telefono}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">Fecha</span>
                    <span className="text-foreground">{new Date(selected.created_at).toLocaleString('es-ES')}</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mensaje</p>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">{selected.mensaje}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Mail size={32} className="text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">Selecciona un mensaje</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelContactos;
