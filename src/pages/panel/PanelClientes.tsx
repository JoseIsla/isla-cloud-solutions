import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { clientsApi, uploadImage, type ClientFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Gestión de Clientes</h2>
        <Button variant="hero" size="default" onClick={() => { setEditing({ name: '', logo_url: '', website_url: '', sort_order: 0 }); setIsNew(true); }}>
          <Plus size={18} /> Nuevo Cliente
        </Button>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg">{isNew ? 'Nuevo' : 'Editar'} Cliente</h3>
              <button onClick={() => setEditing(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre</label>
                <input
                  type="text"
                  value={editing.name ?? ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Logo</label>
                {editing.logo_url && (
                  <div className="mb-2 p-3 rounded-xl bg-background border border-border flex items-center gap-3">
                    <img src={editing.logo_url} alt="Logo" className="h-10 max-w-[120px] object-contain" />
                    <button onClick={() => setEditing({ ...editing, logo_url: '' })} className="text-xs text-destructive hover:underline">Quitar</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir logo'}
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">o pega URL:</span>
                </div>
                <input
                  type="text"
                  value={editing.logo_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Web (URL)</label>
                <input
                  type="text"
                  value={editing.website_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, website_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Orden</label>
                <input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
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
              <th className="text-left p-4 font-medium text-muted-foreground">Logo</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Web</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Orden</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-4">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="h-8 max-w-[80px] object-contain" />
                  ) : (
                    <ImageIcon size={20} className="text-muted-foreground" />
                  )}
                </td>
                <td className="p-4 text-foreground font-medium">{c.name}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                  {c.website_url ? <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{c.website_url}</a> : '—'}
                </td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">{c.sort_order}</td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(c); setIsNew(false); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay clientes. La API no está disponible o no hay datos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PanelLayout>
  );
};

export default PanelClientes;
