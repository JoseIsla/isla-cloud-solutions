import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, Settings2, X } from 'lucide-react';

type CookiePreferences = {
  essential: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
};

const COOKIE_KEY = 'islacloud_cookie_consent';

const getStoredConsent = (): CookiePreferences | null => {
  try {
    const stored = localStorage.getItem(COOKIE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveConsent = (prefs: CookiePreferences) => {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));

  // Dispatch custom event for analytics/scripts to listen
  window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: prefs }));

  // Remove cookies for rejected categories
  if (!prefs.statistics) {
    deleteCookiesByPrefix(['_ga', '_gid', '_gat']);
  }
  if (!prefs.marketing) {
    deleteCookiesByPrefix(['_fbp', '_fbc', 'fr', 'IDE', 'test_cookie']);
  }
};

const deleteCookiesByPrefix = (prefixes: string[]) => {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    if (prefixes.some((p) => name.startsWith(p))) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay for better UX
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const acceptAll = () => {
    const all: CookiePreferences = { essential: true, preferences: true, statistics: true, marketing: true };
    saveConsent(all);
    setVisible(false);
  };

  const rejectAll = () => {
    const min: CookiePreferences = { essential: true, preferences: false, statistics: false, marketing: false };
    saveConsent(min);
    setVisible(false);
  };

  const saveCustom = () => {
    saveConsent({ ...prefs, essential: true });
    setVisible(false);
  };

  const categories = [
    {
      key: 'essential' as const,
      label: 'Esenciales',
      description: 'Necesarias para el funcionamiento básico del sitio. No pueden desactivarse.',
      locked: true,
    },
    {
      key: 'preferences' as const,
      label: 'Preferencias',
      description: 'Permiten recordar tus ajustes como idioma o región.',
      locked: false,
    },
    {
      key: 'statistics' as const,
      label: 'Estadísticas',
      description: 'Nos ayudan a entender cómo interactúas con la web (Google Analytics).',
      locked: false,
    },
    {
      key: 'marketing' as const,
      label: 'Marketing',
      description: 'Se usan para mostrarte publicidad relevante en otras plataformas.',
      locked: false,
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            {/* Main banner */}
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Cookie size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground text-base mb-1">
                    Utilizamos cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar contenido.
                    Puedes aceptar todas, rechazarlas o configurar tus preferencias.{' '}
                    <Link to="/privacidad" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </p>
                </div>
              </div>

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-3 border-t border-border pt-6">
                      {categories.map((cat) => (
                        <div
                          key={cat.key}
                          className="flex items-center justify-between gap-4 p-3 rounded-xl bg-background border border-border"
                        >
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-foreground">{cat.label}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={prefs[cat.key]}
                              disabled={cat.locked}
                              onChange={(e) =>
                                !cat.locked && setPrefs({ ...prefs, [cat.key]: e.target.checked })
                              }
                              className="sr-only peer"
                            />
                            <div className={`
                              w-10 h-5 rounded-full transition-colors
                              ${cat.locked
                                ? 'bg-primary/40 cursor-not-allowed'
                                : 'bg-muted peer-checked:bg-primary cursor-pointer'
                              }
                              after:content-[''] after:absolute after:top-0.5 after:left-0.5
                              after:bg-card after:rounded-full after:h-4 after:w-4
                              after:transition-transform peer-checked:after:translate-x-5
                            `} />
                          </label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="hero" onClick={acceptAll} className="flex-1">
                  Aceptar todas
                </Button>
                {showSettings ? (
                  <Button variant="default" onClick={saveCustom} className="flex-1">
                    Guardar preferencias
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="flex-1 gap-2"
                  >
                    <Settings2 size={16} /> Configurar
                  </Button>
                )}
                <Button variant="ghost" onClick={rejectAll} className="flex-1 text-muted-foreground">
                  Rechazar opcionales
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
