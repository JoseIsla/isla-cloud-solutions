import { useState, useEffect, useCallback } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { testimonialsApi, uploadImage, type TestimonialFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, MessageCircle, Star, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useDragReorder } from '@/hooks/useDragReorder';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

const PanelTestimonios = () => {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState<TestimonialFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<TestimonialFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);

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
    if (!token || !confirm('¿Eliminar este testimonio?')) return;
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
            <p className="text-muted-foreground text-sm mt-0.5">{testimonials.length} testimonios · <span className="text-muted-foreground/60">Arrastra para reordenar</span></p>
          </div>
          <Button size="sm" onClick={() => setEditing({ author_name: '', author_role: '', author_company: '', quote: '', rating: 5, is_active: 1, sort_order: 0 })}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
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
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Avatar</label>
                    <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
                    {editing.avatar_url && <img src={editing.avatar_url} alt="" className="h-8 w-8 mt-1.5 rounded-full object-cover" />}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Puntuación</label>
                    <Input type="number" min={1} max={5} value={editing.rating || 5} onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Orden</label>
                    <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
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
        )}

        <div className="space-y-1">
          {testimonials.length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-border">
              <MessageCircle size={32} className="mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No hay testimonios</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Aparecerán en el landing entre Clientes y Confianza</p>
            </div>
          )}
          {testimonials.map((t, idx) => (
            <div
              key={t.id}
              {...getDragProps(idx)}
              className={`flex items-center gap-4 p-4 rounded-xl bg-card border transition-all duration-150 group ${
                isDragOver(idx) ? 'border-primary/40 shadow-md shadow-primary/5 scale-[1.01]' : 'border-border hover:border-primary/15'
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
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={15} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelTestimonios;
