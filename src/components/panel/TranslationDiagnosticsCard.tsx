import { Button } from '@/components/ui/button';
import { type ContentTranslationDiagnostics } from '@/lib/api';
import { CheckCircle2, CircleAlert, RefreshCw } from 'lucide-react';

interface Props {
  diagnostics: ContentTranslationDiagnostics | null;
  error?: string;
  loading?: boolean;
  onRefresh: () => void;
}

const statusConfig = {
  healthy: {
    label: 'Operativo',
    badgeClass: 'border-primary/20 bg-primary/10 text-primary',
    Icon: CheckCircle2,
  },
  warning: {
    label: 'Revisar',
    badgeClass: 'border-border bg-muted text-foreground',
    Icon: CircleAlert,
  },
  error: {
    label: 'Error',
    badgeClass: 'border-destructive/20 bg-destructive/10 text-destructive',
    Icon: CircleAlert,
  },
} as const;

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-ES');
};

const TranslationDiagnosticsCard = ({ diagnostics, error, loading = false, onRefresh }: Props) => {
  const status = diagnostics ? statusConfig[diagnostics.status] : statusConfig.warning;
  const StatusIcon = status.Icon;

  return (
    <section className="mb-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-heading font-semibold text-foreground">Diagnóstico de traducción EN</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifica si faltan filas __en, el estado de DeepL y el último error capturado del backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${status.badgeClass}`}>
            <StatusIcon size={14} />
            {diagnostics ? status.label : 'Sin datos'}
          </span>

          <Button variant="outline" size="sm" className="gap-2" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-foreground">
          No se pudo cargar el diagnóstico: {error}
        </div>
      )}

      {diagnostics && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Claves ES', value: diagnostics.counts.baseRows },
              { label: 'Claves EN', value: diagnostics.counts.translatedRows },
              { label: 'Pendientes __en', value: diagnostics.counts.missingTranslations },
              { label: 'Desactualizadas', value: diagnostics.counts.staleTranslations },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="text-sm font-medium text-foreground">Estado del backend</h4>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">DeepL</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {diagnostics.runtime.openaiConfigured ? 'Configurada' : 'No configurada'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Transporte</dt>
                  <dd className="mt-1 text-sm text-foreground">{diagnostics.runtime.transport}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Modelo</dt>
                  <dd className="mt-1 text-sm text-foreground">{diagnostics.runtime.model}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Última petición masiva</dt>
                  <dd className="mt-1 text-sm text-foreground">{formatDateTime(diagnostics.lastBulkRequest?.timestamp)}</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Incidencias detectadas</p>
                {diagnostics.issues.length > 0 ? (
                  <ul className="space-y-2 text-sm text-foreground">
                    {diagnostics.issues.map((issue) => (
                      <li key={issue} className="rounded-lg border border-border bg-card px-3 py-2">
                        {issue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay incidencias activas ahora mismo.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="text-sm font-medium text-foreground">Claves a revisar</h4>

              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Sin fila __en</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {diagnostics.sampleMissingKeys.length > 0 ? diagnostics.sampleMissingKeys.map((key) => (
                      <span key={key} className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
                        {key}
                      </span>
                    )) : (
                      <span className="text-sm text-muted-foreground">No hay pendientes detectados.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Desactualizadas</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {diagnostics.sampleStaleKeys.length > 0 ? diagnostics.sampleStaleKeys.map((key) => (
                      <span key={key} className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
                        {key}
                      </span>
                    )) : (
                      <span className="text-sm text-muted-foreground">No hay traducciones desactualizadas.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {diagnostics.lastError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-foreground">Último error capturado</p>
              <p className="mt-1 text-sm text-foreground">{diagnostics.lastError.message}</p>
              {diagnostics.lastError.key && (
                <p className="mt-1 text-xs text-muted-foreground">Clave: {diagnostics.lastError.key}</p>
              )}
              {diagnostics.lastError.details && (
                <p className="mt-1 break-words text-xs text-muted-foreground">{diagnostics.lastError.details}</p>
              )}
            </div>
          )}

          {diagnostics.recentEvents.length > 0 && (
            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="text-sm font-medium text-foreground">Últimos eventos del traductor</h4>
              <div className="mt-3 space-y-2">
                {diagnostics.recentEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-border bg-card px-3 py-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{event.stage}</span>
                        {event.key ? ` · ${event.key}` : ''}
                      </p>
                      <span className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{event.message}</p>
                    {event.details && (
                      <p className="mt-1 break-words text-xs text-muted-foreground">{event.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TranslationDiagnosticsCard;