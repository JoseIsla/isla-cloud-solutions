import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadImage, contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Upload, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.islacloudsolutions.com';

interface LogoUploaderProps {
  contents: Record<string, ContentFromAPI>;
  editValues: Record<string, string>;
  setEditValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const logoFields = [
  { key: 'site_logo_navbar', label: 'Logo del Navbar', desc: 'Se muestra en la barra de navegación superior.' },
  { key: 'site_logo_footer', label: 'Logo del Footer', desc: 'Se muestra en el pie de página.' },
];

const LogoUploader = ({ contents, editValues, setEditValues }: LogoUploaderProps) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (key: string, file: File) => {
    if (!token) return;
    setUploading(key);
    try {
      const { url } = await uploadImage(file, token);
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
      setEditValues(prev => ({ ...prev, [key]: fullUrl }));
      await contentsApi.update(key, fullUrl, token, logoFields.find(f => f.key === key)?.label);
      toast.success('Logo subido y guardado correctamente');
    } catch (e: any) {
      toast.error(e.message || 'Error subiendo el logo');
    } finally {
      setUploading(null);
    }
  };

  const handleClear = async (key: string) => {
    if (!token) return;
    try {
      setEditValues(prev => ({ ...prev, [key]: '' }));
      await contentsApi.update(key, '', token, logoFields.find(f => f.key === key)?.label);
      toast.success('Logo eliminado. Se usará el logo por defecto.');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {logoFields.map(({ key, label, desc }) => {
        const currentUrl = editValues[key] || '';
        return (
          <div key={key} className="p-4 rounded-xl bg-background border border-border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <label className="font-medium text-foreground text-sm">{label}</label>
                <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
              </div>
            </div>

            {currentUrl && (
              <div className="mb-3 p-3 rounded-lg bg-muted/50 flex items-center gap-4">
                <div className="bg-hero rounded-lg p-3 flex items-center justify-center">
                  <img src={currentUrl} alt={label} className="h-10 w-auto max-w-[200px] object-contain" />
                </div>
                <span className="text-xs text-muted-foreground truncate flex-1">{currentUrl}</span>
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
                {uploading === key ? 'Subiendo...' : currentUrl ? 'Cambiar logo' : 'Subir logo'}
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
    </div>
  );
};

export default LogoUploader;
