import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { servicesApi, type ServiceFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const PanelServicios = () => {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<ServiceFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => { servicesApi.list().then(setServices).catch(() => {}); };
  useEffect(load, []);

  const handleSave = async () => {
    if (!token || !editing) return;
    try {
      if (isNew) {
        await servicesApi.create(editing, token);
        toast.success('Servicio creado');
      } else {
        await servicesApi.update(editing.id!, editing, token);
        toast.success('Servicio actualizado');
      }
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('¿Eliminar este servicio?')) return;
    try {
      await servicesApi.delete(id, token);
      toast.success('Servicio eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <PanelLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Gestión de Servicios</h2>
        <Button variant="hero" size="default" onClick={() => { setEditing({ slug: '', title: '', short_title: '', description: '', long_description: '', icon: 'Server', features: [], sort_order: 0 }); setIsNew(true); }}>
          <Plus size={18} /> Nuevo Servicio
        </Button>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg">{isNew ? 'Nuevo' : 'Editar'} Servicio</h3>
              <button onClick={() => setEditing(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'title', label: 'Título', type: 'text' },
                { key: 'short_title', label: 'Título corto', type: 'text' },
                { key: 'slug', label: 'Slug (URL)', type: 'text' },
                { key: 'icon', label: 'Icono (Server, Shield, Cloud, etc.)', type: 'text' },
                { key: 'sort_order', label: 'Orden', type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editing as any)[key] ?? ''}
                    onChange={(e) => setEditing({ ...editing, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción corta</label>
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descripción completa</label>
                <textarea
                  value={editing.long_description ?? ''}
                  onChange={(e) => setEditing({ ...editing, long_description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Características (una por línea)</label>
                <textarea
                  value={(editing.features || []).join('\n')}
                  onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n').filter(Boolean) })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="hero" onClick={handleSave}>Guardar</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Título</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Slug</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Orden</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-4 text-foreground font-medium">{s.title}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{s.slug}</td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">{s.sort_order}</td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(s); setIsNew(false); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No hay servicios. La API no está disponible o no hay datos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PanelLayout>
  );
};

export default PanelServicios;
