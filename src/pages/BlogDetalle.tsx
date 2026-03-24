import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import Layout from "@/components/Layout";
import usePageMeta from "@/hooks/usePageMeta";
import { newsApi, type NewsFromAPI } from "@/lib/api";

const BlogDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    newsApi.get(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <section className="bg-hero grid-pattern py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto animate-pulse space-y-4">
              <div className="h-4 bg-hero-foreground/10 rounded w-1/4" />
              <div className="h-10 bg-hero-foreground/10 rounded w-3/4" />
              <div className="h-4 bg-hero-foreground/10 rounded w-1/2" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <section className="bg-hero grid-pattern py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-heading font-bold text-hero-foreground mb-4">Noticia no encontrada</h1>
            <p className="text-hero-foreground/60 mb-8">La noticia que buscas no existe o ha sido eliminada.</p>
            <Link to="/blog" className="text-primary font-medium hover:underline inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Volver al blog
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  usePageMeta({
    title: post.title,
    description: post.excerpt || `Lee ${post.title} en el blog de Isla Cloud Solutions.`,
    canonical: `/blog/${slug}`,
    ogImage: post.image_url || undefined,
    type: 'article',
    publishedTime: post.published_at || post.created_at,
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Link to="/blog" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1 mb-6">
              <ArrowLeft size={14} /> Volver al blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/15 border border-primary/20 px-2.5 py-1 rounded-full">
                  <Tag size={10} /> {post.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-hero-foreground/50">
                <Calendar size={12} />
                {new Date(post.published_at || post.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-hero-foreground leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-hero-foreground/60 text-lg mt-6 leading-relaxed">{post.excerpt}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Image */}
      {post.image_url && (
        <div className="bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto -mt-8 relative z-10"
            >
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-2xl border border-border shadow-lg object-cover max-h-[420px]"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div
              className="prose prose-lg max-w-none text-foreground prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogDetalle;
