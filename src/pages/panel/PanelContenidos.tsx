import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';

const PanelContenidos = () => {
  const { token } = useAuth();
  const [contents, setContents] = useState<Record<string, ContentFromAPI>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    contentsApi.list().then((data) => {
      setContents(data);
      const vals: Record<string, string> = {};
      Object.values(data).forEach(c => { vals[c.content_key] = c.value; });
      setEditValues(vals);
    }).catch(() => {});
  }, []);

  const handleSave = async (key: string) => {
    if (!token) return;
    try {
      await contentsApi.update(key, editValues[key], token, contents[key]?.title);
      toast.success(`"${contents[key]?.title || key}" actualizado`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const contentEntries = Object.values(contents);

  return (
    <PanelLayout>
      <h2 className="font-heading font-semibold text-xl text-foreground mb-6">Gestión de Contenidos</h2>

      <div className="space-y-6">
        {contentEntries.map((c) => (
          <div key={c.content_key} className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex justify-between items-center mb-3">
              <label className="font-medium text-foreground text-sm">{c.title || c.content_key}</label>
              <Button variant="default" size="sm" onClick={() => handleSave(c.content_key)}>
                <Save size={14} /> Guardar
              </Button>
            </div>
            <textarea
              value={editValues[c.content_key] ?? ''}
              onChange={(e) => setEditValues({ ...editValues, [c.content_key]: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
            />
          </div>
        ))}
        {contentEntries.length === 0 && (
          <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground">
            No hay contenidos editables. La API no está disponible o no hay datos.
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

export default PanelContenidos;
