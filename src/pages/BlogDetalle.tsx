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
import { useT, useLanguage } from "@/i18n/LanguageContext";

const BlogDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const t = useT();
  const { language } = useLanguage();
  const [post, setPost] = useState<NewsFromAPI | null>(null);
  const [related, setRelated] = useState<NewsFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const locale = language === 'en' ? 'en-GB' : 'es-ES';

  useEffect(() => {
    if (!slug) return;
    newsApi.get(slug)
      .then((data) => {
        setPost(data);
        if (data.category) {
          newsApi.list().then((all) => {
            const filtered = all
              .filter((n) => n.category === data.category && n.slug !== data.slug && n.is_published)
              .slice(0, 3);
            setRelated(filtered);
          }).catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const articleJsonLd = useMemo(() => {
    if (!post) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || `${post.title} - ${SITE_NAME}`,
      url: `${SITE_URL}/blog/${slug}`,
      datePublished: post.published_at || post.created_at,
      ...(post.image_url ? { image: post.image_url } : {}),
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
    };
  }, [post, slug]);

  usePageMeta({
    title: post?.meta_title || post?.title || t('blog.label'),
    description: post?.meta_description || post?.excerpt || t('blog.subtitle'),
    canonical: slug ? `/blog/${slug}` : undefined,
    ogImage: post?.image_url || undefined,
    type: post ? 'article' : undefined,
    publishedTime: post?.published_at || post?.created_at || undefined,
    jsonLd: articleJsonLd,
    noindex: !!post?.noindex,
    nofollow: !!post?.nofollow,
  });

  const breadcrumbs = useMemo(() => [
    { name: t('breadcrumb.home'), path: '/' },
    { name: t('blog.label'), path: '/blog' },
    ...(post ? [{ name: post.title, path: `/blog/${slug}` }] : []),
  ], [post?.title, slug, t]);

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
            <h1 className="text-3xl font-heading font-bold text-hero-foreground mb-4">{t('blog.not_found')}</h1>
            <p className="text-hero-foreground/60 mb-8">{t('blog.not_found_desc')}</p>
            <Link to="/blog" className="text-primary font-medium hover:underline inline-flex items-center gap-2">
              <ArrowLeft size={16} /> {t('blog.back')}
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-4 pt-12 md:pt-20">
        <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t('blog.back')}
        </Link>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            {post.category && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/15 border border-primary/20 px-2.5 py-1 rounded-full">
                <Tag size={10} /> {post.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar size={12} />
              {new Date(post.published_at || post.created_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-4">{post.excerpt}</p>
          )}
        </div>

        {post.image_url && (
          <BlurImage src={post.image_url} alt={post.title}
            className="w-full h-auto block object-contain rounded-2xl"
            wrapperClassName="rounded-2xl overflow-hidden" placeholderColor="#0a1628" />
        )}
      </motion.div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto">
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

      {related.length > 0 && (
        <section className="pb-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-8">{t('blog.related')}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.id} to={`/blog/${item.slug}`}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image_url && (
                      <div className="overflow-hidden">
                        <img src={item.image_url} alt={item.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.published_at || item.created_at).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogDetalle;
