import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';
import MediaPicker from '@/components/panel/MediaPicker';

type Section = { title: string; description?: string; keys: string[] };

const SECTIONS: Section[] = [
  {
    title: 'Hero',
    description: 'Título y subtítulo principal de la página.',
    keys: ['about_title', 'about_subtitle'],
  },
  {
    title: 'Estadísticas',
    description: 'Las 4 tarjetas de cifras destacadas.',
    keys: [
      'about_stat1_value', 'about_stat1_label',
      'about_stat2_value', 'about_stat2_label',
      'about_stat3_value', 'about_stat3_label',
      'about_stat4_value', 'about_stat4_label',
    ],
  },
  {
    title: 'Historia',
    description: 'Título y contenido de la sección de historia.',
    keys: ['about_history_title', 'about_history_image', 'about_history'],
  },
  {
    title: 'Pilares',
    description: 'Las 2 tarjetas con los pilares de la empresa.',
    keys: [
      'about_pillar1_title', 'about_pillar1_desc',
      'about_pillar2_title', 'about_pillar2_desc',
    ],
  },
  {
    title: 'Valores',
    description: 'Encabezado y las 4 tarjetas de valores corporativos.',
    keys: [
      'about_values_title',
      'about_values_subtitle',
      'whyus_reason_1_title', 'whyus_reason_1_desc',
      'whyus_reason_2_title', 'whyus_reason_2_desc',
      'whyus_reason_3_title', 'whyus_reason_3_desc',
      'whyus_reason_4_title', 'whyus_reason_4_desc',
    ],
  },
  {
    title: 'CTA final',
    description: 'Llamada a la acción al final de la página.',
    keys: ['about_cta_title', 'about_cta_subtitle', 'about_cta_button'],
  },
];

const PanelSobreNosotros = () => {
  const { token } = useAuth();
  const [contents, setContents] = useState<Record<string, ContentFromAPI>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [mediaOpen, setMediaOpen] = useState<string | null>(null);

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
    if (!c) {
      return (
        <div key={key} className="p-3 rounded-xl bg-muted/40 border border-dashed border-border text-xs text-muted-foreground">
          Falta el campo <code className="px-1 py-0.5 rounded bg-background border border-border">{key}</code> en la base de datos. Reinicia el backend para sembrarlo desde <code>init-db</code>.
        </div>
      );
    }

    return (
      <div key={key} className="p-4 rounded-xl bg-background border border-border">
        <div className="flex justify-between items-center mb-2 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <label className="font-medium text-foreground text-sm truncate">{c.title || c.content_key}</label>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">🌐 Auto-EN</span>
          </div>
          <Button variant="default" size="sm" onClick={() => handleSave(key)}>
            <Save size={14} /> Guardar
          </Button>
        </div>
        {key === 'about_history_image' ? (
          <div className="space-y-3">
            {editValues[key] && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted/30" style={{ maxHeight: 220 }}>
                <img src={editValues[key]} alt="Historia" className="w-full h-full object-cover" style={{ maxHeight: 220 }} />
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={editValues[key] ?? ''}
                onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                placeholder="URL de la imagen (déjalo vacío para usar el icono por defecto)"
                className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <Button variant="outline" size="sm" type="button" onClick={() => setMediaOpen(key)}>
                Galería
              </Button>
              <MediaPicker
                open={mediaOpen === key}
                onClose={() => setMediaOpen(null)}
                onSelect={(url) => {
                  setEditValues({ ...editValues, [key]: url });
                  setMediaOpen(null);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Selecciona una imagen de la galería o pega una URL. Si lo dejas vacío, se mostrará el icono por defecto.</p>
          </div>
        ) : c.content_type === 'html' ? (
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
          Edita todos los textos de la página Sobre Nosotros agrupados por sección.
        </p>
      </div>

      {Object.keys(contents).length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground">
          Cargando contenidos…
        </div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title} className="p-5 rounded-2xl bg-card border border-border">
              <header className="mb-4">
                <h3 className="font-heading font-semibold text-foreground">{section.title}</h3>
                {section.description && (
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                )}
              </header>
              <div className="space-y-3">
                {section.keys.map(renderField)}
              </div>
            </section>
          ))}
        </div>
      )}
    </PanelLayout>
  );
};

export default PanelSobreNosotros;
