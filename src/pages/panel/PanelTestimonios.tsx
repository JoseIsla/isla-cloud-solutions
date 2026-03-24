import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { testimonialsApi, uploadImage, type TestimonialFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, MessageCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

const PanelTestimonios = () => {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState<TestimonialFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<TestimonialFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);

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
      const { url } = await uploadImage(e.target.files[0], token);
      setEditing((prev) => prev ? { ...prev, avatar_url: url } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={16} className={i < rating ? "text-amber-400" : "text-muted-foreground/30"} fill={i < rating ? "currentColor" : "none"} />
    ));

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-foreground">Testimonios</h2>
          <Button onClick={() => setEditing({ author_name: '', author_role: '', author_company: '', quote: '', rating: 5, is_active: 1, sort_order: 0 })}>
            <Plus size={18} /> Nuevo testimonio
          </Button>
        </div>

        {editing && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-lg">
              {editing.id ? 'Editar testimonio' : 'Nuevo testimonio'}
            </h3>
            <div>
              <Label>Cita / Testimonio *</Label>
              <Textarea
                value={editing.quote || ''}
                onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                placeholder="Lo que dice el cliente sobre vuestro servicio..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input
                  value={editing.author_name || ''}
                  onChange={(e) => setEditing({ ...editing, author_name: e.target.value })}
                  placeholder="Juan García"
                />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  value={editing.author_role || ''}
                  onChange={(e) => setEditing({ ...editing, author_role: e.target.value })}
                  placeholder="Director de IT"
                />
              </div>
              <div>
                <Label>Empresa</Label>
                <Input
                  value={editing.author_company || ''}
                  onChange={(e) => setEditing({ ...editing, author_company: e.target.value })}
                  placeholder="Empresa S.L."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Avatar</Label>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
                {editing.avatar_url && <img src={editing.avatar_url} alt="" className="h-10 w-10 mt-2 rounded-full object-cover" />}
              </div>
              <div>
                <Label>Puntuación (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editing.rating || 5}
                  onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })}
                />
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

        <div className="space-y-3">
          {testimonials.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>No hay testimonios todavía</p>
              <p className="text-sm">Añade citas de tus clientes para mostrarlas en el landing</p>
            </div>
          )}
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {t.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-medium text-foreground truncate">"{t.quote.slice(0, 60)}{t.quote.length > 60 ? '...' : ''}"</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.author_name}{t.author_company ? ` · ${t.author_company}` : ''}
                  </p>
                  <div className="flex gap-0.5 mt-1">{renderStars(t.rating)}</div>
                </div>
                {!t.is_active && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded shrink-0">Inactivo</span>
                )}
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(t.id)}>
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

export default PanelTestimonios;
