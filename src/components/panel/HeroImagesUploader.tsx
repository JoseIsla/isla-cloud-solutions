import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MediaPicker from '@/components/panel/MediaPicker';
import { uploadImage, contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

interface HeroImagesUploaderProps {
  contents: Record<string, ContentFromAPI>;
  editValues: Record<string, string>;
  setEditValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const imageFields = [
  { key: 'hero_bg_slide1', label: 'Fondo Slide 1 (Principal)', desc: 'Imagen de fondo del primer slide. Recomendado: 1920×1080px (16:9).' },
  { key: 'hero_bg_slide2', label: 'Fondo Slide 2 (Blog)', desc: 'Imagen de fondo del segundo slide. Recomendado: 1920×1080px (16:9).' },
  { key: 'hero_bg_slide3', label: 'Fondo Slide 3 (Casos de éxito)', desc: 'Imagen de fondo del tercer slide. Recomendado: 1920×1080px (16:9).' },
];

const HeroImagesUploader = ({ contents, editValues, setEditValues }: HeroImagesUploaderProps) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState<string | null>(null);
  const [mediaPickerKey, setMediaPickerKey] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (key: string, file: File) => {
    if (!token) return;
    setUploading(key);
    try {
      const { url } = await uploadImage(file, token);
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
      setEditValues(prev => ({ ...prev, [key]: fullUrl }));
      await contentsApi.update(key, fullUrl, token, imageFields.find(f => f.key === key)?.label);
      toast.success('Imagen subida y guardada');
    } catch (e: any) {
      toast.error(e.message || 'Error subiendo imagen');
    } finally {
      setUploading(null);
    }
  };

  const handleClear = async (key: string) => {
    if (!token) return;
    try {
      setEditValues(prev => ({ ...prev, [key]: '' }));
      await contentsApi.update(key, '', token, imageFields.find(f => f.key === key)?.label);
      toast.success('Imagen eliminada. Se usará la imagen por defecto.');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {imageFields.map(({ key, label, desc }) => {
        const currentUrl = editValues[key] || '';
        return (
          <div key={key} className="p-4 rounded-xl bg-background border border-border">
            <div className="mb-3">
              <label className="font-medium text-foreground text-sm">{label}</label>
              <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
            </div>

            {currentUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-border">
                <img src={currentUrl} alt={label} className="w-full h-32 object-cover" />
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={el => { fileRefs.current[key] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(key, file);
                  e.target.value = '';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={uploading === key}
                onClick={() => fileRefs.current[key]?.click()}
              >
                <Upload size={14} className="mr-1" />
                {uploading === key ? 'Subiendo...' : currentUrl ? 'Cambiar imagen' : 'Subir imagen'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMediaPickerKey(key)}>
                🖼️ Galería
              </Button>
              {currentUrl && (
                <Button variant="ghost" size="sm" onClick={() => handleClear(key)}>
                  <Trash2 size={14} className="mr-1" /> Usar por defecto
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <MediaPicker
        open={!!mediaPickerKey}
        onClose={() => setMediaPickerKey(null)}
        onSelect={async (url) => {
          if (!mediaPickerKey || !token) return;
          setEditValues(prev => ({ ...prev, [mediaPickerKey]: url }));
          await contentsApi.update(mediaPickerKey, url, token, imageFields.find(f => f.key === mediaPickerKey)?.label);
          toast.success('Imagen actualizada desde galería');
        }}
        defaultCategory="fondos"
      />
    </div>
  );
};

export default HeroImagesUploader;
