import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { servicesApi, uploadImage, type ServiceFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, GripVertical, FileText } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

const PanelServicios = () => {
  const { token } = useAuth();
  const [services, setServices] = useState<ServiceFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<ServiceFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, token);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_BASE_URL}${result.url}`;
      setEditing(prev => prev ? { ...prev, image_url: fullUrl } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message || 'Error subiendo imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Servicios</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{services.length} servicios registrados</p>
          </div>
          <Button size="sm" onClick={() => { setEditing({ slug: '', title: '', short_title: '', description: '', long_description: '', icon: 'Server', features: [], image_url: '', sort_order: 0 }); setIsNew(true); }}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        {/* Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{isNew ? 'Nuevo servicio' : 'Editar servicio'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'title', label: 'Título' },
                    { key: 'short_title', label: 'Título corto' },
                    { key: 'slug', label: 'Slug (URL)' },
                    { key: 'icon', label: 'Icono' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={(editing as any)[key] ?? ''}
                        onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Imagen</label>
                  {editing.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-border inline-block">
                      <img src={editing.image_url} alt="" className="h-20 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir'}
                    </Button>
                    <input
                      type="text"
                      value={editing.image_url ?? ''}
                      onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                      placeholder="o pega URL..."
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción corta</label>
                  <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción completa</label>
                  <RichEditor value={editing.long_description ?? ''} onChange={(html) => setEditing({ ...editing, long_description: html })} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Características (una por línea)</label>
                  <textarea value={(editing.features || []).join('\n')} onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n').filter(Boolean) })} rows={3} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave}>Guardar</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors group">
              <GripVertical size={16} className="text-muted-foreground/30 shrink-0" />
              {s.image_url ? (
                <img src={s.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground truncate">{s.slug} · Orden: {s.sort_order}</p>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(s); setIsNew(false); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No hay servicios registrados
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelServicios;
