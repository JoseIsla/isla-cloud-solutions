import { useEffect, useState, useRef } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { newsApi, uploadImage, type NewsFromAPI, API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';

const PanelNoticias = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [news, setNews] = useState<NewsFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<NewsFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!token || !(await confirm('¿Eliminar esta noticia?', 'Se eliminará permanentemente esta noticia.'))) return;
    try {
      await newsApi.delete(id, token);
      toast.success('Noticia eliminada');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, token);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_BASE_URL}${result.url}`;
      setEditing(prev => prev ? { ...prev, image_url: fullUrl } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message || 'Error subiendo imagen');
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
            <h2 className="text-xl font-heading font-bold text-foreground">Noticias / Blog</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{news.length} artículos</p>
          </div>
          <Button size="sm" onClick={() => { setEditing({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: '', is_published: 0 }); setIsNew(true); }}>
            <Plus size={16} /> Nueva noticia
          </Button>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl shadow-2xl mx-auto my-8">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{isNew ? 'Nueva noticia' : 'Editar noticia'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'title', label: 'Título' },
                    { key: 'slug', label: 'Slug' },
                    { key: 'category', label: 'Categoría' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={(editing as any)[key] ?? ''}
                        onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Imagen</label>
                  {editing.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-border inline-block">
                      <img src={editing.image_url} alt="" className="h-20 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir'}
                    </Button>
                    <input type="text" value={editing.image_url ?? ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="o pega URL..." className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Extracto</label>
                  <textarea value={editing.excerpt ?? ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Contenido</label>
                  <RichEditor value={editing.content ?? ''} onChange={(html) => setEditing({ ...editing, content: html })} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-background border border-border">
                  <input type="checkbox" checked={editing.is_published === 1} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked ? 1 : 0 })} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-foreground font-medium">Publicar artículo</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave}>Guardar</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {news.map((n) => (
            <div key={n.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors group">
              {n.image_url ? (
                <img src={n.image_url} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-12 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 text-primary/30 font-heading font-bold text-sm">IC</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {n.category && <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">{n.category}</span>}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${n.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    {n.is_published ? 'Publicada' : 'Borrador'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} /> {new Date(n.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(n); setIsNew(false); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No hay noticias publicadas
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelNoticias;
