import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ParallaxHero from "@/components/ParallaxHero";
import { Skeleton } from "@/components/ui/skeleton";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { newsApi, type NewsFromAPI } from "@/lib/api";
import { useCMSValue } from "@/hooks/useCMS";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 9;

const BlogPage = () => {
  const [posts, setPosts] = useState<NewsFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const blogJsonLd = useMemo(() => {
    if (posts.length === 0) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Blog | ${SITE_NAME}`,
      url: `${SITE_URL}/blog`,
      description: 'Noticias, artículos y novedades sobre tecnología, cloud, seguridad IT y transformación digital.',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: posts.length,
        itemListElement: posts.slice(0, 10).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/blog/${p.slug}`,
          name: p.title,
        })),
      },
    };
  }, [posts]);

  usePageMeta({
    title: 'Blog',
    description: 'Noticias, artículos y novedades sobre tecnología, cloud, seguridad IT y transformación digital de Isla Cloud Solutions.',
    canonical: '/blog',
    jsonLd: blogJsonLd,
  });


  useEffect(() => {
    newsApi.list()
      .then((data) => setPosts(data.filter((p) => p.is_published)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
  const paginatedPosts = posts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <ParallaxHero>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Blog</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">
            {useCMSValue('blog_page_title', 'Noticias y actualidad IT')}
          </h1>
          <p className="text-hero-foreground/70 text-lg">
            {useCMSValue('blog_page_subtitle', 'Mantente al día con las últimas noticias del sector tecnológico y novedades de Isla Cloud Solutions.')}
          </p>
        </motion.div>
      </ParallaxHero>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-card border border-border overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-4/5" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No hay noticias publicadas todavía.</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Las noticias se gestionan desde el panel de administración.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post, index) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px hsl(var(--primary) / 0.15)" }}
                      className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors duration-300 h-full"
                    >
                      {post.image_url ? (
                        <div className="h-48 overflow-hidden">
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                          <span className="text-primary/30 text-5xl font-heading font-bold">IC</span>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          {post.category && (
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                              {post.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar size={12} />
                            {new Date(post.published_at || post.created_at).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <h2 className="font-heading font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                      </div>
                    </motion.article>
                  </Link>
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

export default BlogPage;
