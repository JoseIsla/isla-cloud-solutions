import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mediaApi, uploadImage, type MediaFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Trash2, Search, Image as ImageIcon, Copy, Check, CloudUpload, RefreshCw, CheckSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { usePanelPagination } from '@/hooks/usePanelPagination';

const PanelMedios = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<MediaFromAPI[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [editItem, setEditItem] = useState<MediaFromAPI | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Bulk selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkApplying, setBulkApplying] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaFromAPI | null>(null);

  const selectionMode = selected.size > 0;

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllOnPage = () => {
    const allPageIds = paged.map(i => i.id);
    const allSelected = allPageIds.every(id => selected.has(id));
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        allPageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelected(prev => new Set([...prev, ...allPageIds]));
    }
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      clearSelection();
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const clearSelection = () => {
    setSelected(new Set());
    setBulkCategory('');
  };

  const handleBulkDelete = async () => {
    if (!token || selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} imagen(es) seleccionada(s)?`)) return;
    setBulkApplying(true);
    try {
      await Promise.all(
        Array.from(selected).map(id => mediaApi.delete(id, token))
      );
      toast.success(`${selected.size} imagen(es) eliminada(s)`);
      clearSelection();
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando imágenes');
    } finally {
      setBulkApplying(false);
    }
  };

  const handleBulkCategoryChange = async () => {
    if (!token || !bulkCategory || selected.size === 0) return;
    setBulkApplying(true);
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          mediaApi.update(id, { category: bulkCategory }, token)
        )
      );
      toast.success(`Categoría actualizada en ${selected.size} imagen(es)`);
      clearSelection();
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Error actualizando categorías');
    } finally {
      setBulkApplying(false);
    }
  };

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
        await uploadImage(file, token, filterCategory || 'general');
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

  const handleSync = async () => {
    if (!token) return;
    setSyncing(true);
    try {
      const result = await mediaApi.sync(token);
      toast.success(result.message);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Error sincronizando');
    } finally {
      setSyncing(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files.length > 0) handleUpload(files);
  }, [token]);

  const filtered = items;
  const { page, setPage, totalPages, paged } = usePanelPagination(filtered, 40);

  return (
    <PanelLayout>
      <div
        className="space-y-6 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop overlay */}
        {dragging && (
          <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center pointer-events-none">
            <CloudUpload size={48} className="text-primary mb-3 animate-bounce" />
            <p className="text-primary font-semibold text-lg">Suelta las imágenes aquí</p>
            <p className="text-primary/70 text-sm">Se subirán a la categoría "{uploadCategory}"</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Galería de Medios</h2>
            <p className="text-sm text-muted-foreground">{items.length} archivos</p>
          </div>
          <div className="flex gap-2 flex-wrap">
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
            <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
              <RefreshCw size={14} className={`mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
        </div>

        {/* Bulk selection bar */}
        {selectionMode && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{selected.size} de {items.length} seleccionada(s)</span>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={selectAllOnPage}>
                {paged.every(i => selected.has(i.id)) ? 'Deseleccionar página' : 'Seleccionar página'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={selectAll}>
                {selected.size === items.length ? 'Deseleccionar todo' : `Seleccionar todo (${items.length})`}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" onClick={clearSelection}>
                <X size={12} className="mr-1" /> Cancelar
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Mover a categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="text-xs capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleBulkCategoryChange} disabled={!bulkCategory || bulkApplying}>
                {bulkApplying ? 'Aplicando...' : 'Aplicar'}
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkApplying}>
                <Trash2 size={14} className="mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        )}

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
            {paged.map(item => {
              const isSelected = selected.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-xl border bg-card overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => selectionMode ? toggleSelect(item.id) : setPreviewItem(item)}
                >
                  {/* Selection checkbox */}
                  <div className={`absolute top-2 left-2 z-10 transition-opacity ${
                    selectionMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 border-2 bg-background/80 backdrop-blur-sm"
                    />
                  </div>

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
                  {/* Hover actions - only when not in selection mode */}
                  {!selectionMode && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); copyUrl(item); }} title="Copiar URL">
                        {copied === item.id ? <Check size={14} /> : <Copy size={14} />}
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditItem(item); setEditCategory(item.category); setEditAlt(item.alt_text); }} title="Editar">
                        <ImageIcon size={14} />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} title="Eliminar">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Preview dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewItem && (
            <div>
              <div className="bg-muted flex items-center justify-center max-h-[70vh]">
                <img
                  src={previewItem.url}
                  alt={previewItem.alt_text || previewItem.original_name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{previewItem.original_name || 'Sin nombre'}</p>
                  <span className="text-xs text-muted-foreground capitalize">{previewItem.category}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => copyUrl(previewItem)}>
                    {copied === previewItem.id ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                    Copiar URL
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setPreviewItem(null); setEditItem(previewItem); setEditCategory(previewItem.category); setEditAlt(previewItem.alt_text); }}>
                    <ImageIcon size={14} className="mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setPreviewItem(null); handleDelete(previewItem.id); }}>
                    <Trash2 size={14} className="mr-1" /> Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default PanelMedios;
