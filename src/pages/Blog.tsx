import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { newsApi, type NewsFromAPI } from "@/lib/api";

const BlogPage = () => {
  const [posts, setPosts] = useState<NewsFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi.list()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Blog</span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground mt-3 mb-6">
              Noticias y actualidad IT
            </h1>
            <p className="text-hero-foreground/70 text-lg">
              Mantente al día con las últimas noticias del sector tecnológico y novedades de Isla Cloud Solutions.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                  <div className="h-48 bg-secondary" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-secondary rounded w-1/3" />
                    <div className="h-5 bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No hay noticias publicadas todavía.</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Las noticias se gestionan desde el panel de administración.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
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
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
