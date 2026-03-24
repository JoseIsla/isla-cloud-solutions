import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { clientsApi, uploadImage, type ClientFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

const PanelClientes = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState<ClientFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<ClientFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => { clientsApi.list().then(setClients).catch(() => {}); };
  useEffect(load, []);

  const handleSave = async () => {
    if (!token || !editing) return;
    try {
      if (isNew) {
        await clientsApi.create(editing, token);
        toast.success('Cliente creado');
      } else {
        await clientsApi.update(editing.id!, editing, token);
        toast.success('Cliente actualizado');
      }
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('¿Eliminar este cliente?')) return;
    try {
      await clientsApi.delete(id, token);
      toast.success('Cliente eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, token);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_BASE_URL}${result.url}`;
      setEditing(prev => prev ? { ...prev, logo_url: fullUrl } : prev);
      toast.success('Logo subido');
    } catch (err: any) {
      toast.error(err.message || 'Error subiendo logo');
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
            <h2 className="text-xl font-heading font-bold text-foreground">Clientes</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{clients.length} clientes en el carrusel</p>
          </div>
          <Button size="sm" onClick={() => { setEditing({ name: '', logo_url: '', website_url: '', sort_order: 0 }); setIsNew(true); }}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        {/* Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{isNew ? 'Nuevo cliente' : 'Editar cliente'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nombre</label>
                  <input type="text" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Logo</label>
                  {editing.logo_url && (
                    <div className="mb-2 p-3 rounded-lg bg-muted/30 border border-border flex items-center gap-3">
                      <img src={editing.logo_url} alt="" className="h-8 max-w-[100px] object-contain" />
                      <button onClick={() => setEditing({ ...editing, logo_url: '' })} className="text-[10px] text-destructive hover:underline">Quitar</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir'}
                    </Button>
                    <input type="text" value={editing.logo_url ?? ''} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} placeholder="o pega URL..." className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Web (URL)</label>
                  <input type="text" value={editing.website_url ?? ''} onChange={(e) => setEditing({ ...editing, website_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Orden</label>
                  <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave}>Guardar</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid layout for clients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors group">
              {c.logo_url ? (
                <img src={c.logo_url} alt={c.name} className="w-9 h-9 rounded-lg object-contain bg-muted/30 p-1 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-emerald-500" />
                </div>
              )}
              <span className="text-sm text-foreground truncate flex-1">{c.name}</span>
              <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(c); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
        {clients.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
            No hay clientes registrados
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

export default PanelClientes;
