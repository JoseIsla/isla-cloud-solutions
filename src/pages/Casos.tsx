import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import { casesApi, CaseFromAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Trophy, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 9;

const Casos = () => {
  const [cases, setCases] = useState<CaseFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const casosJsonLd = useMemo(() => {
    if (cases.length === 0) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Casos de Éxito | ${SITE_NAME}`,
      url: `${SITE_URL}/casos`,
      description: 'Descubre cómo hemos ayudado a nuestros clientes a transformar sus negocios.',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: cases.length,
        itemListElement: cases.slice(0, 10).map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/casos/${c.slug || c.id}`,
          name: c.title,
        })),
      },
    };
  }, [cases]);

  usePageMeta({
    title: "Casos de Éxito",
    description: "Descubre cómo hemos ayudado a nuestros clientes a transformar sus negocios con soluciones cloud personalizadas.",
    canonical: "/casos",
    jsonLd: casosJsonLd,
  });

  useEffect(() => {
    casesApi.list()
      .then((data) => setCases(data.filter((c) => c.is_active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(cases.length / ITEMS_PER_PAGE);
  const paginatedCases = cases.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', path: '/' }, { name: 'Casos de Éxito', path: '/casos' }]} />
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Casos de éxito</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">
            Proyectos que hablan por nosotros
          </h1>
          <p className="text-hero-foreground/70 text-lg">
            Conoce cómo hemos ayudado a empresas reales a alcanzar sus objetivos con tecnología cloud.
          </p>
        </motion.div>
      </ParallaxHero>

      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
                  </div>
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Trophy size={48} className="text-muted-foreground/30" />
              <p className="text-muted-foreground">Próximamente publicaremos nuestros casos de éxito.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedCases.map((caso, i) => (
                  <motion.div
                    key={caso.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ y: -6, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                    className="rounded-2xl"
                  >
                    <Link
                      to={`/casos/${caso.slug || caso.id}`}
                      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors duration-300"
                    >
                      {caso.image_url ? (
                        <div className="overflow-hidden rounded-t-2xl">
                          <img
                            src={caso.image_url}
                            alt={caso.title}
                            className="w-full h-auto block object-contain group-hover:scale-[1.02] transition-transform duration-500 rounded-t-2xl"
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
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Casos;
