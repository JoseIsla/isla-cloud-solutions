import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { contentsApi, healthApi, type ContentTranslationDiagnostics, type SmtpHealthCheck, type SmtpTestResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Languages, Loader2, Mail, Send, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import TranslationDiagnosticsCard from '@/components/panel/TranslationDiagnosticsCard';

const PanelTraduccion = () => {
  const { token } = useAuth();
  const [translating, setTranslating] = useState(false);
  const [translatingEntities, setTranslatingEntities] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ContentTranslationDiagnostics | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState('');

  // SMTP diagnostics
  const [smtpCheck, setSmtpCheck] = useState<SmtpHealthCheck | null>(null);
  const [smtpChecking, setSmtpChecking] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<SmtpTestResult | null>(null);
  const [smtpTesting, setSmtpTesting] = useState(false);

  const handleSmtpCheck = useCallback(async () => {
    if (!token) return;
    setSmtpChecking(true);
    try {
      const res = await healthApi.smtpCheck(token);
      setSmtpCheck(res);
      if (res.status === 'ok') toast.success('Conexión SMTP verificada');
      else toast.error(res.message || 'Error en SMTP');
    } catch (e: any) {
      toast.error(e.message || 'Error verificando SMTP');
    } finally {
      setSmtpChecking(false);
    }
  }, [token]);

  const handleSmtpTest = useCallback(async () => {
    if (!token) return;
    setSmtpTesting(true);
    try {
      const res = await healthApi.smtpTest(token);
      setSmtpTestResult(res);
      if (res.status === 'ok') toast.success(`Email enviado a ${res.toEmail}`);
      else toast.error(res.message || 'No se pudo enviar el email');
    } catch (e: any) {
      toast.error(e.message || 'Error enviando email de prueba');
    } finally {
      setSmtpTesting(false);
    }
  }, [token]);

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

      {/* SMTP Diagnostics */}
      <div className="mt-8 mb-4">
        <h2 className="font-heading font-semibold text-xl text-foreground flex items-center gap-2">
          <Mail size={20} /> Diagnóstico SMTP
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Verifica la conexión con el servidor de correo y envía un email real al destinatario configurado en <code className="text-xs bg-muted px-1.5 py-0.5 rounded">contact_email</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-heading font-semibold text-foreground text-sm">Verificar conexión</h3>
          <p className="text-muted-foreground text-xs">
            Comprueba host, puerto, credenciales y la conexión TLS al servidor SMTP sin enviar ningún correo.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={smtpChecking || !token}
            onClick={handleSmtpCheck}
            className="gap-2 w-full"
          >
            {smtpChecking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {smtpChecking ? 'Verificando...' : 'Verificar SMTP'}
          </Button>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-heading font-semibold text-foreground text-sm">Enviar email de prueba</h3>
          <p className="text-muted-foreground text-xs">
            Envía un correo real al <code className="text-xs bg-muted px-1.5 py-0.5 rounded">contact_email</code> para validar entrega de extremo a extremo.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={smtpTesting || !token}
            onClick={handleSmtpTest}
            className="gap-2 w-full"
          >
            {smtpTesting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {smtpTesting ? 'Enviando...' : 'Enviar email de prueba'}
          </Button>
        </div>
      </div>

      {/* SMTP check result */}
      {smtpCheck && (
        <div className={`p-5 rounded-2xl border mb-4 ${smtpCheck.status === 'ok' ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/30'}`}>
          <div className="flex items-start gap-3">
            {smtpCheck.status === 'ok' ? (
              <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-destructive shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${smtpCheck.status === 'ok' ? 'text-foreground' : 'text-destructive'}`}>
                {smtpCheck.message}
              </p>
              {smtpCheck.smtp && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Host: </span><span className="text-foreground font-mono">{smtpCheck.smtp.host}</span></div>
                  <div><span className="text-muted-foreground">Puerto: </span><span className="text-foreground font-mono">{smtpCheck.smtp.port}</span></div>
                  <div><span className="text-muted-foreground">Usuario: </span><span className="text-foreground font-mono break-all">{smtpCheck.smtp.user}</span></div>
                </div>
              )}
              {smtpCheck.contactEmail && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Destinatario: <span className="text-foreground font-mono">{smtpCheck.contactEmail}</span>
                </p>
              )}
              {smtpCheck.missing && smtpCheck.missing.length > 0 && (
                <p className="mt-2 text-xs text-destructive">
                  Variables faltantes: {smtpCheck.missing.join(', ')}
                </p>
              )}
              {smtpCheck.error && (
                <pre className="mt-2 text-xs bg-muted/40 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">{smtpCheck.error}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SMTP test result */}
      {smtpTestResult && (
        <div className={`p-5 rounded-2xl border ${smtpTestResult.status === 'ok' ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/30'}`}>
          <div className="flex items-start gap-3">
            {smtpTestResult.status === 'ok' ? (
              <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
            ) : (
              <XCircle size={20} className="text-destructive shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${smtpTestResult.status === 'ok' ? 'text-foreground' : 'text-destructive'}`}>
                {smtpTestResult.message}
              </p>
              {smtpTestResult.toEmail && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Enviado a: <span className="text-foreground font-mono">{smtpTestResult.toEmail}</span>
                </p>
              )}
              {smtpTestResult.messageId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Message ID: <span className="text-foreground font-mono break-all">{smtpTestResult.messageId}</span>
                </p>
              )}
              {smtpTestResult.accepted && smtpTestResult.accepted.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Aceptados: <span className="text-foreground">{smtpTestResult.accepted.join(', ')}</span>
                </p>
              )}
              {smtpTestResult.rejected && smtpTestResult.rejected.length > 0 && (
                <p className="mt-1 text-xs text-destructive">
                  Rechazados: {smtpTestResult.rejected.join(', ')}
                </p>
              )}
              {smtpTestResult.response && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Respuesta SMTP: <span className="text-foreground font-mono break-all">{smtpTestResult.response}</span>
                </p>
              )}
              {smtpTestResult.error && (
                <pre className="mt-2 text-xs bg-muted/40 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">{smtpTestResult.error}{smtpTestResult.code ? ` (${smtpTestResult.code})` : ''}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

export default PanelTraduccion;
