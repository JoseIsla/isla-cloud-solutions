import { useEffect, useState, useRef, useMemo } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { newsApi, uploadImage, type NewsFromAPI, API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, Calendar, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';
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

const PanelNoticias = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [news, setNews] = useState<NewsFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<NewsFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const catRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingCategories = useMemo(() =>
    [...new Set(news.map(n => n.category).filter(Boolean))].sort()
  , [news]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updateField = (key: string, value: string) => {
    setEditing(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [key]: value };
      if (key === 'title' && (isNew || !prev.slug || prev.slug === generateSlug(prev.title || ''))) {
        updated.slug = generateSlug(value);
      }
      if (key === 'content' && !prev.excerpt) {
        updated.excerpt = stripHtmlToExcerpt(value);
      }
      if (key === 'title' && (!prev.meta_title || prev.meta_title === prev.title)) {
        updated.meta_title = value;
      }
      if (key === 'content' && (!prev.meta_description || prev.meta_description === stripHtmlToExcerpt(prev.content || '', 155))) {
        updated.meta_description = stripHtmlToExcerpt(value, 155);
      }
      return updated;
    });
  };

  const regenerateSeoFields = () => {
    setEditing(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slug: generateSlug(prev.title || ''),
        meta_title: prev.title || '',
        meta_description: stripHtmlToExcerpt(prev.content || '', 155),
      };
    });
  };

  const load = () => { if (token) newsApi.list(token).then(setNews).catch(() => {}); };
  useEffect(load, [token]);

  const filtered = news.filter(n =>
    !filter || n.title.toLowerCase().includes(filter.toLowerCase()) || (n.category || '').toLowerCase().includes(filter.toLowerCase())
  );

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

        {/* Filter */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar por título o categoría..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
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
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Título</label>
                    <input type="text" value={editing.title ?? ''} onChange={(e) => updateField('title', e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Slug</label>
                    <input type="text" value={editing.slug ?? ''} onChange={(e) => updateField('slug', e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div ref={catRef} className="relative">
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Categoría</label>
                    <input
                      type="text"
                      value={editing.category ?? ''}
                      onChange={(e) => { updateField('category', e.target.value); setCatOpen(true); }}
                      onFocus={() => setCatOpen(true)}
                      placeholder="Seleccionar o escribir nueva..."
                      className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                    {catOpen && existingCategories.length > 0 && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {existingCategories
                          .filter(cat => !editing.category || cat.toLowerCase().includes((editing.category || '').toLowerCase()))
                          .map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => { updateField('category', cat); setCatOpen(false); }}
                              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              {cat}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
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
                  <textarea value={editing.excerpt ?? ''} onChange={(e) => updateField('excerpt', e.target.value)} rows={2} placeholder="Se genera automáticamente del contenido si lo dejas vacío" className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>

                {/* SEO Parameters */}
                <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">🔍 Parámetros SEO</p>
                    <button
                      type="button"
                      onClick={regenerateSeoFields}
                      className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                      title="Regenerar todos los campos SEO automáticamente"
                    >
                      <RefreshCw size={11} /> Regenerar todo
                    </button>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">URL Amigable *</label>
                    <div className="flex gap-2">
                      <input type="text" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="/mi-articulo" className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                      <button type="button" onClick={() => setEditing({ ...editing, slug: generateSlug(editing.title || '') })} className="p-2.5 rounded-lg border border-border hover:bg-primary/10 text-primary shrink-0" title="Regenerar desde título">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Meta título</label>
                    <div className="flex gap-2">
                      <input type="text" value={editing.meta_title ?? ''} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} placeholder={editing.title || 'Se usa el título del artículo'} className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" maxLength={70} />
                      <button type="button" onClick={() => setEditing({ ...editing, meta_title: editing.title || '' })} className="p-2.5 rounded-lg border border-border hover:bg-primary/10 text-primary shrink-0" title="Regenerar desde título">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{(editing.meta_title || '').length}/70 caracteres</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Meta descripción</label>
                    <textarea value={editing.meta_description ?? ''} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} rows={2} placeholder={editing.excerpt || 'Se genera del contenido automáticamente'} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" maxLength={160} />
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
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Contenido</label>
                  <RichEditor value={editing.content ?? ''} onChange={(html) => updateField('content', html)} />
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

        <StaggerList className="space-y-2">
          {filtered.map((n) => (
            <StaggerItem key={n.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/15 transition-colors group">
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
            </StaggerItem>
          ))}
          {news.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No hay noticias publicadas
            </div>
          )}
          {news.length > 0 && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No se encontraron resultados para "{filter}"
            </div>
          )}
        </StaggerList>
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelNoticias;
