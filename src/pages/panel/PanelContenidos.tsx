import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';
import NavLinksManager from '@/components/panel/NavLinksManager';
import LogoUploader from '@/components/panel/LogoUploader';
import HeroImagesUploader from '@/components/panel/HeroImagesUploader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SectionGroup {
  label: string;
  description: string;
  keys: string[];
  customRenderer?: boolean;
  tab: string;
}

const TAB_CONFIG = [
  { id: 'visual', label: '🎨 Visual', description: 'Logotipos, imágenes y navegación' },
  { id: 'cabecera', label: '🏠 Cabecera', description: 'Hero e introducción' },
  { id: 'secciones', label: '📦 Secciones', description: 'Servicios, contadores, clientes y más' },
  { id: 'footer', label: '📞 Footer y CTA', description: 'Contacto, pie de página y redes' },
  { id: 'legal', label: '⚖️ Legal', description: 'Textos legales y visibilidad' },
];

const sectionGroups: SectionGroup[] = [
  // TAB: Visual
  {
    tab: 'visual',
    label: '🖼️ Logotipos',
    description: 'Sube logos personalizados para el Navbar y el Footer.',
    keys: ['site_logo_navbar', 'site_logo_footer'],
    customRenderer: true,
  },
  {
    tab: 'visual',
    label: '🌄 Imágenes del Hero',
    description: 'Cambia las imágenes de fondo de los 3 slides del Hero.',
    keys: ['hero_bg_slide1', 'hero_bg_slide2', 'hero_bg_slide3'],
    customRenderer: true,
  },
  {
    tab: 'visual',
    label: '🧭 Navegación',
    description: 'Gestiona etiquetas, visibilidad y orden de los enlaces del menú.',
    keys: ['nav_link1_label', 'nav_link2_label', 'nav_link3_label', 'nav_link4_label', 'nav_link5_label', 'nav_cta_text',
           'nav_link1_path', 'nav_link2_path', 'nav_link3_path', 'nav_link4_path', 'nav_link5_path',
           'nav_link1_visible', 'nav_link2_visible', 'nav_link3_visible', 'nav_link4_visible', 'nav_link5_visible',
           'nav_link1_order', 'nav_link2_order', 'nav_link3_order', 'nav_link4_order', 'nav_link5_order'],
    customRenderer: true,
  },

  // TAB: Cabecera
  {
    tab: 'cabecera',
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
    tab: 'cabecera',
    label: '📝 Introducción',
    description: 'Texto principal que aparece debajo del hero.',
    keys: ['intro_text'],
  },

  // TAB: Secciones
  {
    tab: 'secciones',
    label: '⚙️ Servicios',
    description: 'Título de la sección de servicios en el landing y página de servicios.',
    keys: ['services_section_title', 'services_page_title', 'services_page_subtitle'],
  },
  {
    tab: 'secciones',
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
    tab: 'secciones',
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
    tab: 'secciones',
    label: '🏢 Clientes (Textos)',
    description: 'Etiqueta, título y subtítulo de la sección de clientes.',
    keys: ['clients_section_label', 'clients_section_title', 'clients_section_subtitle'],
  },
  {
    tab: 'secciones',
    label: '💬 Testimonios (Textos)',
    description: 'Etiqueta, título y subtítulo de la sección de testimonios.',
    keys: ['testimonials_section_label', 'testimonials_section_title', 'testimonials_section_subtitle'],
  },
  {
    tab: 'secciones',
    label: '❓ FAQ (Textos)',
    description: 'Etiqueta, título y subtítulo de la sección de preguntas frecuentes.',
    keys: ['faq_section_label', 'faq_section_title', 'faq_section_subtitle'],
  },
  {
    tab: 'secciones',
    label: '📰 Blog (Página)',
    description: 'Título y subtítulo de la página del blog.',
    keys: ['blog_page_title', 'blog_page_subtitle'],
  },
  {
    tab: 'secciones',
    label: '🏢 Sobre Nosotros',
    description: 'Textos de la página Sobre Nosotros.',
    keys: ['about_title', 'about_subtitle', 'about_history_title', 'about_history', 'about_values_title'],
  },

  // TAB: Footer y CTA
  {
    tab: 'footer',
    label: '📢 CTA (Llamada a la acción)',
    description: 'Título, subtítulo, botón y tarjetas de contacto.',
    keys: [
      'cta_title', 'cta_subtitle', 'cta_button',
      'cta_card1_title', 'cta_card1_desc',
      'cta_card2_title', 'cta_card2_desc',
    ],
  },
  {
    tab: 'footer',
    label: '📞 Contacto & Footer',
    description: 'Datos de contacto, textos del pie de página y enlaces legales.',
    keys: [
      'contact_phone', 'contact_email', 'contact_address',
      'contact_title', 'contact_subtitle',
      'footer_description', 'footer_services_title', 'footer_company_title', 'footer_contact_title',
      'footer_company_link1', 'footer_company_link2', 'footer_company_link3',
      'footer_legal_link1', 'footer_legal_link2', 'footer_legal_link3', 'footer_copyright',
    ],
  },
  {
    tab: 'footer',
    label: '🌐 Redes Sociales',
    description: 'URLs de los perfiles sociales. Deja en blanco para ocultar el icono en la web.',
    keys: [
      'social_linkedin', 'social_twitter', 'social_facebook',
      'social_instagram', 'social_youtube', 'social_github',
    ],
  },

  // TAB: Legal
  {
    tab: 'legal',
    label: '👁️ Visibilidad en el Footer',
    description: 'Activa o desactiva las páginas legales que aparecen en el pie de página.',
    keys: ['legal_aviso_visible', 'legal_privacidad_visible', 'legal_cookies_visible'],
    customRenderer: true,
  },
  {
    tab: 'legal',
    label: '📜 Aviso Legal',
    description: 'Contenido completo de la página de Aviso Legal.',
    keys: ['legal_aviso_content'],
  },
  {
    tab: 'legal',
    label: '🔒 Política de Privacidad',
    description: 'Contenido completo de la página de Política de Privacidad.',
    keys: ['legal_privacidad_content'],
  },
  {
    tab: 'legal',
    label: '🍪 Política de Cookies',
    description: 'Contenido completo de la página de Política de Cookies.',
    keys: ['legal_cookies_content'],
  },
];

const allKnownKeys = sectionGroups.flatMap(g => g.keys);

const PanelContenidos = () => {
  const { token } = useAuth();
  const [contents, setContents] = useState<Record<string, ContentFromAPI>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
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

  const renderSectionGroup = (group: SectionGroup) => {
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
            {group.customRenderer && group.label === '🧭 Navegación' ? (
              <NavLinksManager contents={contents} editValues={editValues} setEditValues={setEditValues} />
            ) : group.customRenderer && group.label === '🖼️ Logotipos' ? (
              <LogoUploader contents={contents} editValues={editValues} setEditValues={setEditValues} />
            ) : group.customRenderer && group.label === '🌄 Imágenes del Hero' ? (
              <HeroImagesUploader contents={contents} editValues={editValues} setEditValues={setEditValues} />
            ) : group.customRenderer && group.label === '👁️ Visibilidad en el Footer' ? (
              <div className="space-y-3">
                {[
                  { key: 'legal_aviso_visible', label: 'Aviso Legal' },
                  { key: 'legal_privacidad_visible', label: 'Política de Privacidad' },
                  { key: 'legal_cookies_visible', label: 'Política de Cookies' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                    <span className="font-medium text-foreground text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {(editValues[key] ?? 'true') === 'true' ? 'Visible' : 'Oculto'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={(editValues[key] ?? 'true') === 'true'}
                        onClick={() => {
                          const newVal = (editValues[key] ?? 'true') === 'true' ? 'false' : 'true';
                          setEditValues({ ...editValues, [key]: newVal });
                          if (token) {
                            contentsApi.update(key, newVal, token, contents[key]?.title).then(() => {
                              toast.success(`${label}: ${newVal === 'true' ? 'visible' : 'oculto'} en el footer`);
                            }).catch((e: any) => toast.error(e.message));
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (editValues[key] ?? 'true') === 'true' ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (editValues[key] ?? 'true') === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              group.keys.map(renderField)
            )}
          </div>
        )}
      </div>
    );
  };

  const contentKeys = Object.keys(contents);
  const ungroupedKeys = contentKeys.filter(k => !allKnownKeys.includes(k));

  return (
    <PanelLayout>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Contenidos Web</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Todos los textos e imágenes de la web organizados por categoría.
        </p>
      </div>

      {Object.keys(contents).length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center text-muted-foreground">
          No hay contenidos editables. La API no está disponible o no hay datos.
        </div>
      ) : (
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/50 p-1 rounded-xl h-auto flex-wrap">
            {TAB_CONFIG.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TAB_CONFIG.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4 mt-0">
              {sectionGroups
                .filter(g => g.tab === tab.id)
                .map(renderSectionGroup)}
            </TabsContent>
          ))}

          {/* Ungrouped */}
          {ungroupedKeys.length > 0 && (
            <div className="mt-6 rounded-2xl bg-card border border-border overflow-hidden">
              <button
                onClick={() => toggleSection('__other')}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <h3 className="font-heading font-semibold text-foreground">📦 Otros contenidos</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">Contenidos no clasificados.</p>
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
        </Tabs>
      )}
    </PanelLayout>
  );
};

export default PanelContenidos;
