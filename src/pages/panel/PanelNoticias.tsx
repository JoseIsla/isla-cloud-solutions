import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { newsApi, type NewsFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const PanelNoticias = () => {
  const { token } = useAuth();
  const [news, setNews] = useState<NewsFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<NewsFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => { if (token) newsApi.list(token).then(setNews).catch(() => {}); };
  useEffect(load, [token]);

  const handleSave = async () => {
    if (!token || !editing) return;
    try {
      if (isNew) {
        await newsApi.create(editing, token);
        toast.success('Noticia creada');
      } else {
        await newsApi.update(editing.id!, editing, token);
        toast.success('Noticia actualizada');
      }
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('¿Eliminar esta noticia?')) return;
    try {
      await newsApi.delete(id, token);
      toast.success('Noticia eliminada');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <PanelLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Gestión de Noticias</h2>
        <Button variant="hero" size="default" onClick={() => { setEditing({ title: '', slug: '', excerpt: '', content: '', category: '', is_published: 0 }); setIsNew(true); }}>
          <Plus size={18} /> Nueva Noticia
        </Button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-semibold text-lg">{isNew ? 'Nueva' : 'Editar'} Noticia</h3>
              <button onClick={() => setEditing(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'title', label: 'Título' },
                { key: 'slug', label: 'Slug (URL)' },
                { key: 'category', label: 'Categoría' },
                { key: 'image_url', label: 'URL imagen' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                  <input
                    type="text"
                    value={(editing as any)[key] ?? ''}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Extracto</label>
                <textarea
                  value={editing.excerpt ?? ''}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Contenido</label>
                <textarea
                  value={editing.content ?? ''}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_published === 1}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Publicada</span>
              </label>
              <div className="flex gap-3 pt-4">
                <Button variant="hero" onClick={handleSave}>Guardar</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Título</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Categoría</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Estado</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {news.map((n) => (
              <tr key={n.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-4 text-foreground font-medium">{n.title}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{n.category}</td>
                <td className="p-4 hidden md:table-cell">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${n.is_published ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {n.is_published ? 'Publicada' : 'Borrador'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(n); setIsNew(false); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No hay noticias.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PanelLayout>
  );
};

export default PanelNoticias;
