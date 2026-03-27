import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { testimonialsApi, uploadImage, type TestimonialFromAPI, API_BASE_URL } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, MessageCircle, Star, X, GripVertical, Search, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { toast } from 'sonner';
import { useDragReorder } from '@/hooks/useDragReorder';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';
import { usePanelPagination } from '@/hooks/usePanelPagination';
import Pagination from '@/components/Pagination';

const PanelTestimonios = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [testimonials, setTestimonials] = useState<TestimonialFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<TestimonialFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const handleReorder = useCallback(async (reordered: TestimonialFromAPI[]) => {
    if (!token) return;
    try {
      await Promise.all(reordered.map((t, i) => testimonialsApi.update(t.id, { ...t, sort_order: i }, token)));
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error guardando orden');
      fetchData();
    }
  }, [token]);

  const { getDragProps, isDragOver } = useDragReorder({ items: testimonials, setItems: setTestimonials, onReorder: handleReorder });

  const fetchData = () => {
    if (!token) return;
    testimonialsApi.listAll(token).then(setTestimonials).catch(() => toast.error('Error cargando testimonios'));
  };

  useEffect(fetchData, [token]);

  const moveItem = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= testimonials.length) return;
    const reordered = [...testimonials];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    reordered.forEach((t, i) => (t.sort_order = i));
    setTestimonials(reordered);
    await handleReorder(reordered);
  };

  const moveToEdge = async (idx: number, target: 'first' | 'last') => {
    if (idx === (target === 'first' ? 0 : testimonials.length - 1)) return;
    const reordered = [...testimonials];
    const [moved] = reordered.splice(idx, 1);
    target === 'first' ? reordered.unshift(moved) : reordered.push(moved);
    reordered.forEach((t, i) => (t.sort_order = i));
    setTestimonials(reordered);
    await handleReorder(reordered);
  };

  const filtered = testimonials.filter(t =>
    !filter || t.author_name.toLowerCase().includes(filter.toLowerCase()) || t.author_company.toLowerCase().includes(filter.toLowerCase()) || t.quote.toLowerCase().includes(filter.toLowerCase())
  );
  const { page, setPage, totalPages, paged } = usePanelPagination(filtered);

  const handleSave = async () => {
    if (!editing || !token) return;
    setLoading(true);
    try {
      if (editing.id) {
        await testimonialsApi.update(editing.id, editing, token);
        toast.success('Testimonio actualizado');
      } else {
        await testimonialsApi.create(editing, token);
        toast.success('Testimonio creado');
      }
      setEditing(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !(await confirm('¿Eliminar este testimonio?', 'Se eliminará permanentemente este testimonio.'))) return;
    try {
      await testimonialsApi.delete(id, token);
      toast.success('Testimonio eliminado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !token) return;
    try {
      const result = await uploadImage(e.target.files[0], token);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_BASE_URL}${result.url}`;
      setEditing((prev) => prev ? { ...prev, avatar_url: fullUrl } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={13} className={i < rating ? "text-amber-400" : "text-muted-foreground/20"} fill={i < rating ? "currentColor" : "none"} />
    ));

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Testimonios</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{testimonials.length} testimonios</p>
          </div>
          <Button size="sm" onClick={() => setEditing({ author_name: '', author_role: '', author_company: '', quote: '', rating: 5, is_active: 1, sort_order: testimonials.length })}>
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
            placeholder="Buscar por nombre, empresa o contenido..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {editing && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 min-h-screen">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl my-8">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{editing.id ? 'Editar testimonio' : 'Nuevo testimonio'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cita / Testimonio</label>
                  <Textarea value={editing.quote || ''} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} placeholder="Lo que dice el cliente..." rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nombre</label>
                    <Input value={editing.author_name || ''} onChange={(e) => setEditing({ ...editing, author_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cargo</label>
                    <Input value={editing.author_role || ''} onChange={(e) => setEditing({ ...editing, author_role: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Empresa</label>
                    <Input value={editing.author_company || ''} onChange={(e) => setEditing({ ...editing, author_company: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Avatar</label>
                    <p className="text-[10px] text-muted-foreground/70 mb-1">200×200px, cuadrada.</p>
                    <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
                    {editing.avatar_url && <img src={editing.avatar_url} alt="" className="h-8 w-8 mt-1.5 rounded-full object-cover" />}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Puntuación</label>
                    <Input type="number" min={1} max={5} value={editing.rating || 5} onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                  <Switch checked={!!editing.is_active} onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked ? 1 : 0 })} />
                  <Label className="text-sm">Activo</Label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        , document.body)}

        <StaggerList className="space-y-1">
          {testimonials.length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-border">
              <MessageCircle size={32} className="mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No hay testimonios</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Aparecerán en el landing entre Clientes y Confianza</p>
            </div>
          )}
          {paged.map((t) => {
            const realIdx = testimonials.indexOf(t);
            return (
              <StaggerItem
                key={t.id}
                {...getDragProps(realIdx)}
                className={`flex items-center gap-3 p-4 rounded-xl bg-card border transition-all duration-150 group ${
                  isDragOver(realIdx) ? 'border-primary/40 shadow-md shadow-primary/5 scale-[1.01]' : 'border-border hover:border-primary/15'
                }`}
              >
                <GripVertical size={16} className="text-muted-foreground/30 shrink-0 cursor-grab active:cursor-grabbing" />
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {t.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate italic">"{t.quote.slice(0, 70)}{t.quote.length > 70 ? '...' : ''}"</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-foreground">{t.author_name}</span>
                    {t.author_company && <span className="text-xs text-muted-foreground">· {t.author_company}</span>}
                    <div className="flex gap-0.5 ml-1">{renderStars(t.rating)}</div>
                  </div>
                </div>
                {!t.is_active && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium shrink-0">Inactivo</span>
                )}
                {!filter && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveToEdge(realIdx, 'first')} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground" title="Mover al inicio"><ChevronsUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, -1)} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, 1)} disabled={realIdx === testimonials.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronDown size={14} /></button>
                    <button onClick={() => moveToEdge(realIdx, 'last')} disabled={realIdx === testimonials.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground" title="Mover al final"><ChevronsDown size={14} /></button>
                  </div>
                )}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={15} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
                </div>
              </StaggerItem>
            );
          })}
          {testimonials.length > 0 && filtered.length === 0 && (
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

export default PanelTestimonios;
