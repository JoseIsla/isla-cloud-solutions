import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mediaApi, uploadImage, type MediaFromAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  /** Pre-select category filter */
  defaultCategory?: string;
}

const MediaPicker = ({ open, onClose, onSelect, defaultCategory }: MediaPickerProps) => {
  const { token } = useAuth();
  const [items, setItems] = useState<MediaFromAPI[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState(defaultCategory || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!token) return;
    const [media, cats] = await Promise.all([
      mediaApi.list(token, { category: filterCategory || undefined, search: searchTerm || undefined }),
      mediaApi.categories(token),
    ]);
    setItems(media);
    setCategories(cats);
  };

  useEffect(() => {
    if (open) { load(); setSelected(null); }
  }, [open, token, filterCategory, searchTerm]);

  const handleUpload = async (file: File) => {
    if (!token) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, token, defaultCategory || 'general');
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
      toast.success('Imagen subida');
      load();
      setSelected(fullUrl);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const confirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col z-[100]" overlayClassName="z-[100]">
        <DialogHeader>
          <DialogTitle>Seleccionar imagen</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gallery" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="upload">Subir nueva</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="flex-1 flex flex-col min-h-0 space-y-3 mt-3">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
              <Select value={filterCategory || 'all'} onValueChange={(v) => setFilterCategory(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
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
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon size={36} className="opacity-30 mb-2" />
                  <p className="text-xs">No hay imágenes</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selected === item.url
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <img src={item.url} alt={item.alt_text || item.original_name} className="w-full h-full object-cover" loading="lazy" />
                      {selected === item.url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={24} className="text-primary-foreground drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
              <Button size="sm" disabled={!selected} onClick={confirm}>Seleccionar</Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center space-y-4 mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full max-w-sm border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <Upload size={32} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {uploading ? 'Subiendo...' : 'Haz clic para subir una imagen'}
              </p>
              <p className="text-[10px] text-muted-foreground">JPG, PNG, GIF, WebP, SVG — Máx. 5MB</p>
            </div>
            {selected && (
              <div className="text-center space-y-2">
                <img src={selected} alt="" className="h-24 mx-auto rounded-lg object-cover" />
                <Button size="sm" onClick={confirm}>Usar esta imagen</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPicker;
