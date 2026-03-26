import { useState, useEffect } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { casesApi, uploadImage, type CaseFromAPI, API_BASE_URL } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichEditor from '@/components/ui/rich-editor';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Trophy, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const PanelCasos = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [cases, setCases] = useState<CaseFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<CaseFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCases = () => {
    if (!token) return;
    casesApi.list(token).then(setCases).catch(() => toast.error('Error cargando casos'));
  };

  useEffect(fetchCases, [token]);

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
          <Button size="sm" onClick={() => setEditing({ title: '', client_name: '', excerpt: '', description: '', is_active: 1, sort_order: 0 })}>
            <Plus size={16} /> Nuevo caso
          </Button>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{editing.id ? 'Editar caso' : 'Nuevo caso de éxito'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Título</label>
                    <Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cliente</label>
                    <Input value={editing.client_name || ''} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} />
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

        <div className="space-y-2">
          {cases.length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-border">
              <Trophy size={32} className="mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No hay casos de éxito</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Aparecerán en el slider del hero</p>
            </div>
          )}
          {cases.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors group">
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
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelCasos;
