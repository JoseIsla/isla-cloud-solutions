import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';
import NavLinksManager from '@/components/panel/NavLinksManager';

interface SectionGroup {
  label: string;
  description: string;
  keys: string[];
}

const sectionGroups: SectionGroup[] = [
  {
    label: '🏠 Hero (Cabecera)',
    description: 'Título principal, subtítulo, botones y pestañas del slider.',
    keys: [
      'hero_title', 'hero_subtitle', 'hero_badge',
      'hero_cta_primary', 'hero_cta_secondary',
      'hero_tab1_label', 'hero_tab2_label', 'hero_tab3_label',
      'hero_slide2_title', 'hero_slide2_subtitle', 'hero_slide2_cta', 'hero_slide2_cta_secondary',
      'hero_slide3_title', 'hero_slide3_subtitle', 'hero_slide3_cta', 'hero_slide3_cta_secondary',
    ],
  },
  {
    label: '📝 Introducción',
    description: 'Texto principal que aparece debajo del hero.',
    keys: ['intro_text'],
  },
  {
    label: '⚙️ Servicios',
    description: 'Título de la sección de servicios en el landing y página de servicios.',
    keys: ['services_section_title', 'services_page_title', 'services_page_subtitle'],
  },
  {
    label: '✅ ¿Por qué elegirnos?',
    description: 'Título, subtítulo y las 4 razones.',
    keys: [
      'whyus_section_label', 'whyus_section_title', 'whyus_section_subtitle',
      'whyus_reason_1_title', 'whyus_reason_1_desc',
      'whyus_reason_2_title', 'whyus_reason_2_desc',
      'whyus_reason_3_title', 'whyus_reason_3_desc',
      'whyus_reason_4_title', 'whyus_reason_4_desc',
    ],
  },
  {
    label: '📊 Contadores',
    description: 'Cifras y etiquetas de las métricas.',
    keys: [
      'counter_projects', 'counter_projects_label',
      'counter_maintenance', 'counter_maintenance_label',
      'counter_clients', 'counter_clients_label',
      'counter_systems', 'counter_systems_label',
    ],
  },
  {
    label: '🏢 Clientes (Textos)',
    description: 'Etiqueta, título y subtítulo de la sección de clientes.',
    keys: ['clients_section_label', 'clients_section_title', 'clients_section_subtitle'],
  },
  {
    label: '🛡️ Confianza / TrustLocal',
    description: 'Sección de verificación y badge de confianza.',
    keys: [
      'trust_section_label', 'trust_section_title', 'trust_section_subtitle',
      'trust_badge_name', 'trust_badge_score', 'trust_badge_max_score',
      'trust_badge_reviews', 'trust_badge_url', 'trust_badge_stars', 'trust_badge_description',
    ],
  },
  {
    label: '📢 CTA (Llamada a la acción)',
    description: 'Título, subtítulo, botón y tarjetas de contacto.',
    keys: [
      'cta_title', 'cta_subtitle', 'cta_button',
      'cta_card1_title', 'cta_card1_desc',
      'cta_card2_title', 'cta_card2_desc',
    ],
  },
  {
    label: '📞 Contacto & Footer',
    description: 'Datos de contacto y descripción del pie de página.',
    keys: [
      'contact_phone', 'contact_email', 'contact_address',
      'contact_title', 'contact_subtitle',
      'footer_description',
    ],
  },
  {
    label: '📰 Blog (Página)',
    description: 'Título y subtítulo de la página del blog.',
    keys: ['blog_page_title', 'blog_page_subtitle'],
  },
  {
    label: '🏢 Sobre Nosotros',
    description: 'Textos de la página Sobre Nosotros.',
    keys: ['about_title', 'about_subtitle', 'about_history_title', 'about_history', 'about_values_title'],
  },
  {
    label: '🧭 Navegación',
    description: 'Gestiona etiquetas, visibilidad y orden de los enlaces del menú.',
    keys: ['nav_link1_label', 'nav_link2_label', 'nav_link3_label', 'nav_link4_label', 'nav_link5_label', 'nav_cta_text',
           'nav_link1_visible', 'nav_link2_visible', 'nav_link3_visible', 'nav_link4_visible', 'nav_link5_visible',
           'nav_link1_order', 'nav_link2_order', 'nav_link3_order', 'nav_link4_order', 'nav_link5_order'],
    customRenderer: true as any,
  },
];

const allKnownKeys = sectionGroups.flatMap(g => g.keys);

const PanelContenidos = () => {
  const { token } = useAuth();
  const [contents, setContents] = useState<Record<string, ContentFromAPI>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderField = (key: string) => {
    const c = contents[key];
    if (!c) return null;

    return (
      <div key={key} className="p-4 rounded-xl bg-background border border-border">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-foreground text-sm">{c.title || c.content_key}</label>
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

  const contentKeys = Object.keys(contents);
  const ungroupedKeys = contentKeys.filter(k => !allKnownKeys.includes(k));

  return (
    <PanelLayout>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Gestión de Contenidos</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Todos los textos de la web organizados por sección. Edita y guarda individualmente.
        </p>
      </div>

      <div className="space-y-4">
        {sectionGroups.map((group) => {
          const hasContent = group.keys.some(k => contents[k]);
          if (!hasContent) return null;

          const isOpen = openSections[group.label] ?? false;

          return (
            <div key={group.label} className="rounded-2xl bg-card border border-border overflow-hidden">
              <button
                onClick={() => toggleSection(group.label)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{group.label}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{group.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {group.keys.filter(k => contents[k]).length} campos
                  </span>
                  {isOpen ? <ChevronDown size={18} className="text-muted-foreground" /> : <ChevronRight size={18} className="text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <div className="p-5 pt-0 space-y-3">
                  {group.keys.map(renderField)}
                </div>
              )}
            </div>
          );
        })}

        {/* Ungrouped (other CMS keys not in any section) */}
        {ungroupedKeys.length > 0 && (
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <button
              onClick={() => toggleSection('__other')}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors text-left"
            >
              <div>
                <h3 className="font-heading font-semibold text-foreground">📦 Otros contenidos</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Contenidos no clasificados en una sección específica.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {ungroupedKeys.length} campos
                </span>
                {openSections['__other'] ? <ChevronDown size={18} className="text-muted-foreground" /> : <ChevronRight size={18} className="text-muted-foreground" />}
              </div>
            </button>
            {openSections['__other'] && (
              <div className="p-5 pt-0 space-y-3">
                {ungroupedKeys.map(renderField)}
              </div>
            )}
          </div>
        )}

        {Object.keys(contents).length === 0 && (
          <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground">
            No hay contenidos editables. La API no está disponible o no hay datos.
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

export default PanelContenidos;
