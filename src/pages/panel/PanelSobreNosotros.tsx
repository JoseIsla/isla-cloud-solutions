import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';

const ABOUT_KEYS = [
  'about_history_title',
  'about_history',
  'about_values_title',
];

const PanelSobreNosotros = () => {
  const { token } = useAuth();
  const [contents, setContents] = useState<Record<string, ContentFromAPI>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const loadContents = useCallback(async () => {
    (token ? contentsApi.listFresh(token) : contentsApi.list()).then((data) => {
      setContents(data);
      const vals: Record<string, string> = {};
      Object.values(data).forEach(c => { vals[c.content_key] = c.value; });
      setEditValues(vals);
    }).catch(() => {});
  }, [token]);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  const handleSave = async (key: string) => {
    if (!token) return;
    try {
      const result = await contentsApi.update(key, editValues[key], token, contents[key]?.title);
      toast.success(
        result.translation?.queued
          ? `"${contents[key]?.title || key}" actualizado y enviado a traducir`
          : `"${contents[key]?.title || key}" actualizado`
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const renderField = (key: string) => {
    const c = contents[key];
    if (!c) return null;

    return (
      <div key={key} className="p-4 rounded-xl bg-background border border-border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <label className="font-medium text-foreground text-sm">{c.title || c.content_key}</label>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">🌐 Auto-EN</span>
          </div>
          <Button variant="default" size="sm" onClick={() => handleSave(key)}>
            <Save size={14} /> Guardar
          </Button>
        </div>
        {c.content_type === 'html' ? (
          <RichEditor
            value={editValues[key] ?? ''}
            onChange={(html) => setEditValues({ ...editValues, [key]: html })}
          />
        ) : (
          <textarea
            value={editValues[key] ?? ''}
            onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
            rows={c.value && c.value.length > 100 ? 4 : 2}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
          />
        )}
      </div>
    );
  };

  return (
    <PanelLayout>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Sobre Nosotros</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Edita los textos de la página Sobre Nosotros: historia, valores y contenido principal.
        </p>
      </div>

      {Object.keys(contents).length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground">
          Cargando contenidos…
        </div>
      ) : (
        <div className="space-y-4">
          {ABOUT_KEYS.map(renderField)}
        </div>
      )}
    </PanelLayout>
  );
};

export default PanelSobreNosotros;
