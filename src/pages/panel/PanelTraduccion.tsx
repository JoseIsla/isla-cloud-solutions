import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, type ContentTranslationDiagnostics } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import TranslationDiagnosticsCard from '@/components/panel/TranslationDiagnosticsCard';

const PanelTraduccion = () => {
  const { token } = useAuth();
  const [translating, setTranslating] = useState(false);
  const [translatingEntities, setTranslatingEntities] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ContentTranslationDiagnostics | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState('');

  const loadDiagnostics = useCallback(async () => {
    if (!token) return;
    setDiagnosticsLoading(true);
    setDiagnosticsError('');
    try {
      const response = await contentsApi.diagnostics(token);
      setDiagnostics(response.diagnostics);
    } catch (e: any) {
      setDiagnosticsError(e.message || 'No se pudo cargar el diagnóstico');
    } finally {
      setDiagnosticsLoading(false);
    }
  }, [token]);

  const scheduleDiagnosticsRefresh = useCallback((delay = 1600) => {
    if (!token) return;
    window.setTimeout(() => { void loadDiagnostics(); }, delay);
  }, [loadDiagnostics, token]);

  useEffect(() => {
    if (!token) return;
    void loadDiagnostics();
  }, [loadDiagnostics, token]);

  const handleTranslateAll = async () => {
    if (!token) return;
    setTranslating(true);
    try {
      const res = await contentsApi.translateAll(token);
      setDiagnostics(res.diagnostics);
      if (res.ok) {
        toast.success(`${res.count} contenidos enviados a traducir.`);
        scheduleDiagnosticsRefresh(2200);
      } else {
        toast.error(res.message || 'Error en la traducción');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al traducir');
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateEntities = async () => {
    if (!token) return;
    setTranslatingEntities(true);
    try {
      const res = await contentsApi.translateEntities(token);
      if (res.ok) {
        toast.success(`${res.count} entidades enviadas a traducir.`);
        scheduleDiagnosticsRefresh(2200);
      } else {
        toast.error(res.message || 'Error al traducir entidades');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al traducir entidades');
    } finally {
      setTranslatingEntities(false);
    }
  };

  return (
    <PanelLayout>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Traducción Automática</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona las traducciones automáticas ES → EN de todos los contenidos de la web.
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-heading font-semibold text-foreground text-sm">Contenidos Web (CMS)</h3>
          <p className="text-muted-foreground text-xs">
            Traduce todos los textos editables del CMS: títulos, descripciones, botones, secciones, etc.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={translating || !token}
            onClick={handleTranslateAll}
            className="gap-2 w-full"
          >
            {translating ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
            {translating ? 'Traduciendo...' : 'Traducir contenidos CMS'}
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-heading font-semibold text-foreground text-sm">Entidades Dinámicas</h3>
          <p className="text-muted-foreground text-xs">
            Traduce servicios, noticias, casos de éxito, testimonios y FAQs.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={translatingEntities || !token}
            onClick={handleTranslateEntities}
            className="gap-2 w-full"
          >
            {translatingEntities ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
            {translatingEntities ? 'Traduciendo...' : 'Traducir entidades'}
          </Button>
        </div>
      </div>

      {/* Diagnostics */}
      {token && (
        <TranslationDiagnosticsCard
          diagnostics={diagnostics}
          error={diagnosticsError}
          loading={diagnosticsLoading}
          onRefresh={() => void loadDiagnostics()}
        />
      )}
    </PanelLayout>
  );
};

export default PanelTraduccion;
