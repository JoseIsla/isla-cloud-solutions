import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mediaApi, uploadImage, type MediaFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Trash2, Search, Image as ImageIcon, Copy, Check, CloudUpload } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { usePanelPagination } from '@/hooks/usePanelPagination';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

const PanelMedios = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<MediaFromAPI[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [editItem, setEditItem] = useState<MediaFromAPI | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const loadData = async () => {
    if (!token) return;
    const [media, cats] = await Promise.all([
      mediaApi.list(token, { category: filterCategory || undefined, search: searchTerm || undefined }),
      mediaApi.categories(token),
    ]);
    setItems(media);
    setCategories(cats);
  };

  useEffect(() => { loadData(); }, [token, filterCategory, searchTerm]);

  const handleUpload = async (files: FileList) => {
    if (!token) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file, token);
      }
      toast.success(`${files.length} imagen(es) subida(s)`);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Error subiendo imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('¿Eliminar esta imagen de la galería?')) return;
    try {
      await mediaApi.delete(id, token);
      toast.success('Imagen eliminada');
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = async () => {
    if (!token || !editItem) return;
    try {
      await mediaApi.update(editItem.id, { category: editCategory, alt_text: editAlt }, token);
      toast.success('Actualizado');
      setEditItem(null);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copyUrl = (item: MediaFromAPI) => {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = items;
  const { page, setPage, totalPages, paged } = usePanelPagination(filtered, 20);

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Galería de Medios</h2>
            <p className="text-sm text-muted-foreground">{items.length} archivos</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload size={14} className="mr-1" />
              {uploading ? 'Subiendo...' : 'Subir imagen'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Todas</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay imágenes{filterCategory ? ` en "${filterCategory}"` : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paged.map(item => (
              <div key={item.id} className="group relative rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img
                    src={item.url}
                    alt={item.alt_text || item.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-foreground truncate font-medium">{item.original_name || 'Sin nombre'}</p>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{item.category}</span>
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(item)} title="Copiar URL">
                    {copied === item.id ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => { setEditItem(item); setEditCategory(item.category); setEditAlt(item.alt_text); }} title="Editar">
                    <ImageIcon size={14} />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(item.id)} title="Eliminar">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar imagen</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <img src={editItem.url} alt="" className="w-full h-40 object-cover rounded-lg" />
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Categoría</label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c} className="text-sm capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Texto alternativo (alt)</label>
                <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} className="h-9 text-sm" />
              </div>
              <Button onClick={handleEdit} className="w-full">Guardar cambios</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default PanelMedios;
