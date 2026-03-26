import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { casesApi, CaseFromAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageMeta from "@/hooks/usePageMeta";

const CasoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const [caso, setCaso] = useState<CaseFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  usePageMeta({
    title: caso ? `${caso.title} | Isla Cloud Solutions` : "Caso de éxito",
    description: caso?.excerpt || "Descubre cómo ayudamos a nuestros clientes a alcanzar sus objetivos.",
  });

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
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground">
            Cargando...
          </motion.div>
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
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 py-12 md:py-20"
      >
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver
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
            dangerouslySetInnerHTML={{ __html: caso.description }}
          />
        )}
      </motion.article>
    </Layout>
  );
};

export default CasoDetalle;
