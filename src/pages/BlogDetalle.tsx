import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { newsApi, type NewsFromAPI } from "@/lib/api";
import { sanitizeHTML } from "@/lib/sanitize";
import ShareButtons from "@/components/ShareButtons";
import BlurImage from "@/components/BlurImage";

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

  // Build JSON-LD (safe even when post is null)
  const articleJsonLd = useMemo(() => {
    if (!post) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || `Lee ${post.title} en el blog de ${SITE_NAME}.`,
      url: `${SITE_URL}/blog/${slug}`,
      datePublished: post.published_at || post.created_at,
      ...(post.image_url ? { image: post.image_url } : {}),
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${slug}`,
      },
    };
  }, [post, slug]);

  // Always call hooks unconditionally — before any early returns
  usePageMeta({
    title: post?.meta_title || post?.title || "Blog",
    description: post?.meta_description || post?.excerpt || "Lee las últimas noticias en el blog de Isla Cloud Solutions.",
    canonical: slug ? `/blog/${slug}` : undefined,
    ogImage: post?.image_url || undefined,
    type: post ? 'article' : undefined,
    publishedTime: post?.published_at || post?.created_at || undefined,
    jsonLd: articleJsonLd,
    noindex: !!post?.noindex,
    nofollow: !!post?.nofollow,
  });

  const breadcrumbs = useMemo(() => [
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
    ...(post ? [{ name: post.title, path: `/blog/${slug}` }] : []),
  ], [post?.title, slug]);

  if (loading) {
    return (
      <Layout>
        <section className="bg-hero grid-pattern py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="h-3 w-16 bg-hero-foreground/10 rounded animate-pulse" />
              <div className="h-4 bg-hero-foreground/10 rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-hero-foreground/10 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-hero-foreground/10 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </section>
        <div className="bg-background py-16">
          <div className="container mx-auto px-4 max-w-3xl space-y-4">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </div>
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

  return (
    <Layout>
      <BreadcrumbJsonLd items={breadcrumbs} />
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
              <BlurImage
                src={post.image_url}
                alt={post.title}
                className="w-full h-full rounded-2xl shadow-lg object-contain"
                wrapperClassName="rounded-2xl aspect-video"
                placeholderColor="#0a1628"
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
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
            />
            <div className="mt-10 pt-6 border-t border-border">
              <ShareButtons path={`/blog/${slug}`} title={post.title} />
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogDetalle;
