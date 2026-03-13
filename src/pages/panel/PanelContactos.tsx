import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contactsApi, type ContactFromAPI } from '@/lib/api';
import { Trash2, Mail, MailOpen } from 'lucide-react';
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

  return (
    <PanelLayout>
      <h2 className="font-heading font-semibold text-xl text-foreground mb-6">Formularios de Contacto</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 rounded-2xl bg-card border border-border overflow-hidden max-h-[70vh] overflow-y-auto">
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelected(c); if (!c.is_read) markRead(c); }}
              className={`w-full text-left p-4 border-b border-border hover:bg-secondary/30 transition-colors ${selected?.id === c.id ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {c.is_read ? <MailOpen size={14} className="text-muted-foreground" /> : <Mail size={14} className="text-primary" />}
                <span className={`text-sm font-medium ${c.is_read ? 'text-foreground' : 'text-primary'}`}>{c.nombre}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{c.mensaje}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{new Date(c.created_at).toLocaleDateString('es-ES')}</p>
            </button>
          ))}
          {contacts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No hay mensajes.</div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-8">
          {selected ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">{selected.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                </div>
                <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-4 text-sm">
                {selected.empresa && <div><span className="text-muted-foreground">Empresa:</span> <span className="text-foreground ml-2">{selected.empresa}</span></div>}
                {selected.telefono && <div><span className="text-muted-foreground">Teléfono:</span> <span className="text-foreground ml-2">{selected.telefono}</span></div>}
                <div><span className="text-muted-foreground">Fecha:</span> <span className="text-foreground ml-2">{new Date(selected.created_at).toLocaleString('es-ES')}</span></div>
                <div className="pt-4 border-t border-border">
                  <span className="text-muted-foreground block mb-2">Mensaje:</span>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selected.mensaje}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              Selecciona un mensaje para ver los detalles
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelContactos;
