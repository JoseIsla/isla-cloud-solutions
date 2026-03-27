import { useState, useEffect } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { casesApi, clientsApi, uploadImage, type CaseFromAPI, type ClientFromAPI, API_BASE_URL } from '@/lib/api';
import { useDragReorder } from '@/hooks/useDragReorder';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichEditor from '@/components/ui/rich-editor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Trophy, X, Upload, GripVertical, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const stripHtmlToExcerpt = (html: string, maxLen = 155) => {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
};

const PanelCasos = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [cases, setCases] = useState<CaseFromAPI[]>([]);
  const [clients, setClients] = useState<ClientFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<CaseFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientsApi.list().then(setClients).catch(() => {});
  }, []);

  const fetchCases = () => {
    if (!token) return;
    casesApi.list(token).then(setCases).catch(() => toast.error('Error cargando casos'));
  };

  useEffect(fetchCases, [token]);

  const handleReorder = async (reordered: CaseFromAPI[]) => {
    if (!token) return;
    try {
      await Promise.all(
        reordered.map((c) =>
          casesApi.update(c.id, { ...c, sort_order: c.sort_order }, token)
        )
      );
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error actualizando orden');
      fetchCases();
    }
  };

  const { getDragProps, isDragOver } = useDragReorder({
    items: cases,
    setItems: setCases,
    onReorder: handleReorder,
  });

  const handleSave = async () => {
    if (!editing || !token) return;
    setLoading(true);
    try {
      if (editing.id) {
        await casesApi.update(editing.id, editing, token);
        toast.success('Caso actualizado');
      } else {
        await casesApi.create(editing, token);
        toast.success('Caso creado');
      }
      setEditing(null);
      fetchCases();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !(await confirm('¿Eliminar este caso de éxito?', 'Se eliminará permanentemente este caso de éxito.'))) return;
    try {
      await casesApi.delete(id, token);
      toast.success('Caso eliminado');
      fetchCases();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !token) return;
    try {
      const result = await uploadImage(e.target.files[0], token);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_BASE_URL}${result.url}`;
      setEditing((prev) => prev ? { ...prev, image_url: fullUrl } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Casos de Éxito</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{cases.length} casos registrados</p>
          </div>
          <Button size="sm" onClick={() => setEditing({ title: '', slug: '', client_name: '', excerpt: '', description: '', is_active: 1, sort_order: 0, meta_title: '', meta_description: '', noindex: 0, nofollow: 0 })}>
            <Plus size={16} /> Nuevo caso
          </Button>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl mx-auto my-8">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{editing.id ? 'Editar caso' : 'Nuevo caso de éxito'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Título</label>
                    <Input value={editing.title || ''} onChange={(e) => {
                      const title = e.target.value;
                      setEditing(prev => {
                        if (!prev) return prev;
                        const updated = { ...prev, title };
                        // Auto-slug
                        if (!prev.id || !prev.slug || prev.slug === generateSlug(prev.title || '')) {
                          updated.slug = generateSlug(title);
                        }
                        // Auto meta_title
                        if (!prev.meta_title || prev.meta_title === prev.title) {
                          updated.meta_title = title;
                        }
                        return updated;
                      });
                    }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cliente</label>
                    <Select value={editing.client_name || ''} onValueChange={(val) => setEditing({ ...editing, client_name: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.filter(c => c.is_active).map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Resumen</label>
                  <Textarea value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción</label>
                  <RichEditor value={editing.description || ''} onChange={(html) => setEditing((prev) => prev ? { ...prev, description: html } : prev)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Imagen</label>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    {editing.image_url && <img src={editing.image_url} alt="" className="h-12 mt-2 rounded-lg object-cover" />}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Orden</label>
                    <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
                  </div>
                </div>
                {/* SEO Parameters */}
                <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">🔍 Parámetros SEO</p>
                    <button
                      type="button"
                      onClick={() => setEditing(prev => prev ? {
                        ...prev,
                        slug: generateSlug(prev.title || ''),
                        meta_title: prev.title || '',
                        meta_description: stripHtmlToExcerpt(prev.description || '', 155),
                      } : prev)}
                      className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                    >
                      <RefreshCw size={11} /> Regenerar todo
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">URL Amigable *</label>
                    <div className="flex gap-2">
                      <Input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="/mi-caso-de-exito" className="flex-1" />
                      <button type="button" onClick={() => setEditing({ ...editing, slug: generateSlug(editing.title || '') })} className="p-2.5 rounded-lg border border-border hover:bg-primary/10 text-primary shrink-0" title="Regenerar desde título">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Meta título</label>
                    <div className="flex gap-2">
                      <Input value={editing.meta_title || ''} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} placeholder={editing.title || 'Se usa el título del caso'} maxLength={70} className="flex-1" />
                      <button type="button" onClick={() => setEditing({ ...editing, meta_title: editing.title || '' })} className="p-2.5 rounded-lg border border-border hover:bg-primary/10 text-primary shrink-0" title="Regenerar desde título">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{(editing.meta_title || '').length}/70 caracteres</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Meta descripción</label>
                    <Textarea value={editing.meta_description || ''} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} rows={2} placeholder={editing.excerpt || 'Se genera del contenido automáticamente'} maxLength={160} />
                    <p className="text-[10px] text-muted-foreground mt-1">{(editing.meta_description || '').length}/160 caracteres</p>
                  </div>
                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!editing.noindex} onChange={(e) => setEditing({ ...editing, noindex: e.target.checked ? 1 : 0 })} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-xs text-foreground">NoIndex</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!editing.nofollow} onChange={(e) => setEditing({ ...editing, nofollow: e.target.checked ? 1 : 0 })} className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-xs text-foreground">NoFollow</span>
                    </label>
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

        <StaggerList className="space-y-2">
          {cases.length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-border">
              <Trophy size={32} className="mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No hay casos de éxito</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Aparecerán en el slider del hero</p>
            </div>
          )}
          {cases.map((c, idx) => (
            <StaggerItem
              key={c.id}
              {...getDragProps(idx)}
              className={`flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors group cursor-grab active:cursor-grabbing ${
                isDragOver(idx) ? 'border-primary/40 bg-primary/5' : ''
              }`}
            >
              <GripVertical size={16} className="text-muted-foreground shrink-0" />
              {c.image_url ? (
                <img src={c.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Trophy size={16} className="text-amber-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.client_name}</p>
              </div>
              {!c.is_active && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium shrink-0">Inactivo</span>
              )}
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(c)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={15} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelCasos;
