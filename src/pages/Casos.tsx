import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { casesApi, CaseFromAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageMeta from "@/hooks/usePageMeta";

const Casos = () => {
  const [cases, setCases] = useState<CaseFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: "Casos de Éxito | Isla Cloud Solutions",
    description: "Descubre cómo hemos ayudado a nuestros clientes a transformar sus negocios con soluciones cloud personalizadas.",
  });

  useEffect(() => {
    casesApi.list()
      .then((data) => setCases(data.filter((c) => c.is_active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
              Casos de éxito
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Proyectos que hablan por nosotros
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conoce cómo hemos ayudado a empresas reales a alcanzar sus objetivos con tecnología cloud.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Trophy size={48} className="text-muted-foreground/30" />
              <p className="text-muted-foreground">Próximamente publicaremos nuestros casos de éxito.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((caso, i) => (
                <motion.div
                  key={caso.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/casos/${caso.id}`}
                    className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    {caso.image_url ? (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={caso.image_url}
                          alt={caso.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-primary/5 flex items-center justify-center">
                        <Trophy size={40} className="text-primary/30" />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <p className="text-xs font-medium text-primary uppercase tracking-wider">
                        {caso.client_name}
                      </p>
                      <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {caso.title}
                      </h2>
                      {caso.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {caso.excerpt}
                        </p>
                      )}
                      <div className="flex items-center text-sm font-medium text-primary pt-2">
                        Ver detalle <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Casos;
