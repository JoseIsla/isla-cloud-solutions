import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import MediaPicker from '@/components/panel/MediaPicker';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { clientsApi, uploadImage, type ClientFromAPI, API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, Building2, GripVertical, Search, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { toast } from 'sonner';
import { useDragReorder } from '@/hooks/useDragReorder';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';
import { usePanelPagination } from '@/hooks/usePanelPagination';
import Pagination from '@/components/Pagination';

const PanelClientes = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [clients, setClients] = useState<ClientFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<ClientFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReorder = useCallback(async (reordered: ClientFromAPI[]) => {
    if (!token) return;
    try {
      await Promise.all(reordered.map((c, i) => clientsApi.update(c.id, { ...c, sort_order: i }, token)));
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error guardando orden');
      load();
    }
  }, [token]);

  const { getDragProps, isDragOver } = useDragReorder({ items: clients, setItems: setClients, onReorder: handleReorder });

  const [filter, setFilter] = useState('');

  const load = () => { clientsApi.list().then(setClients).catch(() => {}); };
  useEffect(load, []);

  const moveItem = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= clients.length) return;
    const reordered = [...clients];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    reordered.forEach((c, i) => (c.sort_order = i));
    setClients(reordered);
    await handleReorder(reordered);
  };

  const moveToEdge = async (idx: number, target: 'first' | 'last') => {
    if (idx === (target === 'first' ? 0 : clients.length - 1)) return;
    const reordered = [...clients];
    const [moved] = reordered.splice(idx, 1);
    target === 'first' ? reordered.unshift(moved) : reordered.push(moved);
    reordered.forEach((c, i) => (c.sort_order = i));
    setClients(reordered);
    await handleReorder(reordered);
  };

  const filtered = clients.filter(c =>
    !filter || c.name.toLowerCase().includes(filter.toLowerCase())
  );
  const { page, setPage, totalPages, paged } = usePanelPagination(filtered);

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
    if (!token || !(await confirm('¿Eliminar este cliente?', 'Se eliminará permanentemente este cliente.'))) return;
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
            <p className="text-muted-foreground text-sm mt-0.5">{clients.length} clientes · <span className="text-muted-foreground/60">Arrastra para reordenar</span></p>
          </div>
          <Button size="sm" onClick={() => { setEditing({ name: '', logo_url: '', website_url: '', sort_order: clients.length }); setIsNew(true); }}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        {/* Filter */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar clientes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 min-h-screen">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl my-8">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => setMediaPicker(true)}>
                      Galería
                    </Button>
                    <input type="text" value={editing.logo_url ?? ''} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} placeholder="o pega URL..." className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <MediaPicker
                    open={mediaPicker}
                    onClose={() => setMediaPicker(false)}
                    onSelect={(url) => setEditing(prev => prev ? { ...prev, logo_url: url } : prev)}
                    defaultCategory="clientes"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Web (URL)</label>
                  <input type="text" value={editing.website_url ?? ''} onChange={(e) => setEditing({ ...editing, website_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
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
        <StaggerList className="space-y-1">
          {paged.map((c) => {
            const realIdx = clients.indexOf(c);
            return (
              <StaggerItem
                key={c.id}
                {...getDragProps(realIdx)}
                className={`flex items-center gap-3 p-3 rounded-xl bg-card border transition-all duration-150 group ${
                  isDragOver(realIdx) ? 'border-primary/40 shadow-md shadow-primary/5 scale-[1.01]' : 'border-border hover:border-primary/15'
                }`}
              >
                <GripVertical size={14} className="text-muted-foreground/30 shrink-0 cursor-grab active:cursor-grabbing" />
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="w-9 h-9 rounded-lg object-contain bg-muted/30 p-1 shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                    <Building2 size={14} className="text-primary" />
                  </div>
                )}
                <span className="text-sm text-foreground truncate flex-1">{c.name}</span>
                {!filter && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveToEdge(realIdx, 'first')} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground" title="Mover al inicio"><ChevronsUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, -1)} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, 1)} disabled={realIdx === clients.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronDown size={14} /></button>
                    <button onClick={() => moveToEdge(realIdx, 'last')} disabled={realIdx === clients.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground" title="Mover al final"><ChevronsDown size={14} /></button>
                  </div>
                )}
                <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(c); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={13} /></button>
                </div>
              </StaggerItem>
            );
          })}
          {clients.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No hay clientes registrados
            </div>
          )}
          {clients.length > 0 && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No se encontraron resultados para "{filter}"
            </div>
          )}
        </StaggerList>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelClientes;
