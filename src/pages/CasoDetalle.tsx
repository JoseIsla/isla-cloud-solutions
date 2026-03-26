import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { casesApi, CaseFromAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageMeta from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { sanitizeHTML } from "@/lib/sanitize";
import ShareButtons from "@/components/ShareButtons";

const CasoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const [caso, setCaso] = useState<CaseFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Always call hooks unconditionally
  usePageMeta({
    title: caso?.title || "Caso de éxito",
    description: caso?.excerpt || "Descubre cómo ayudamos a nuestros clientes a alcanzar sus objetivos.",
    canonical: id ? `/casos/${id}` : undefined,
  });

  const breadcrumbs = useMemo(() => [
    { name: 'Inicio', path: '/' },
    { name: 'Casos de Éxito', path: '/casos' },
    ...(caso ? [{ name: caso.title, path: `/casos/${id}` }] : []),
  ], [caso?.title, id]);

  useEffect(() => {
    if (!id) return;
    casesApi.get(Number(id))
      .then(setCaso)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-8" />
          <div className="rounded-2xl bg-muted aspect-video animate-pulse mb-8" />
          <div className="space-y-4">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !caso) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-lg">Caso de éxito no encontrado</p>
          <Button asChild variant="outline">
            <Link to="/casos"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a casos</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 py-12 md:py-20"
      >
        <Link
          to="/casos"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver a casos
        </Link>

        {caso.image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-muted">
            <img
              src={caso.image_url}
              alt={caso.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            Caso de éxito
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {caso.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Cliente: <span className="font-semibold text-foreground">{caso.client_name}</span>
          </p>
        </div>

        {caso.excerpt && (
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-4">
            {caso.excerpt}
          </p>
        )}

        {caso.description && (
          <div
            className="mt-8 prose prose-lg max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(caso.description) }}
          />
        )}

        <div className="mt-10 pt-6 border-t border-border">
          <ShareButtons path={`/casos/${id}`} title={caso.title} />
        </div>
      </motion.article>
    </Layout>
  );
};

export default CasoDetalle;
