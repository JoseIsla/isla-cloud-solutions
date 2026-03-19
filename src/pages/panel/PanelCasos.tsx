import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { casesApi, uploadImage, type CaseFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const PanelCasos = () => {
  const { token } = useAuth();
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
    if (!token || !confirm('¿Eliminar este caso de éxito?')) return;
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
      const { url } = await uploadImage(e.target.files[0], token);
      setEditing((prev) => prev ? { ...prev, image_url: url } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-foreground">Casos de Éxito</h2>
          <Button onClick={() => setEditing({ title: '', client_name: '', excerpt: '', description: '', is_active: 1, sort_order: 0 })}>
            <Plus size={18} /> Nuevo caso
          </Button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-lg">
              {editing.id ? 'Editar caso' : 'Nuevo caso de éxito'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Migración cloud para empresa X"
                />
              </div>
              <div>
                <Label>Nombre del cliente</Label>
                <Input
                  value={editing.client_name || ''}
                  onChange={(e) => setEditing({ ...editing, client_name: e.target.value })}
                  placeholder="Empresa S.L."
                />
              </div>
            </div>
            <div>
              <Label>Resumen corto (se muestra en el hero)</Label>
              <Textarea
                value={editing.excerpt || ''}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                placeholder="Breve descripción del caso de éxito..."
                rows={3}
              />
            </div>
            <div>
              <Label>Descripción completa</Label>
              <Textarea
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Descripción detallada del caso..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Imagen</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {editing.image_url && <img src={editing.image_url} alt="" className="h-16 mt-2 rounded" />}
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={editing.sort_order || 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={!!editing.is_active}
                  onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked ? 1 : 0 })}
                />
                <Label>Activo</Label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Cases list */}
        <div className="space-y-3">
          {cases.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy size={48} className="mx-auto mb-4 opacity-30" />
              <p>No hay casos de éxito todavía</p>
              <p className="text-sm">Crea el primero para que aparezca en el slider del hero</p>
            </div>
          )}
          {cases.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-4">
                {c.image_url && <img src={c.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div>
                  <h4 className="font-medium text-foreground">{c.title}</h4>
                  <p className="text-sm text-muted-foreground">{c.client_name}</p>
                </div>
                {!c.is_active && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Inactivo</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(c.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelCasos;
