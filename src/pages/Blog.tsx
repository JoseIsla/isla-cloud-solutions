import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import Layout from "@/components/Layout";

const blogPosts = [
  {
    id: 1,
    title: "Cómo proteger tu empresa del ransomware en 2026",
    excerpt: "Descubre las mejores prácticas y herramientas para proteger tu infraestructura IT contra ataques de ransomware.",
    date: "2026-03-10",
    category: "Seguridad",
  },
  {
    id: 2,
    title: "Ventajas de migrar a la nube para PYMEs",
    excerpt: "La migración cloud ya no es solo para grandes empresas. Analizamos los beneficios para pequeñas y medianas empresas.",
    date: "2026-03-01",
    category: "Cloud",
  },
  {
    id: 3,
    title: "Novedades en administración de sistemas con IA",
    excerpt: "La inteligencia artificial está revolucionando la gestión de infraestructuras IT. Te contamos las últimas tendencias.",
    date: "2026-02-20",
    category: "Tecnología",
  },
];

const BlogPage = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <span className="text-primary/40 text-6xl font-heading font-bold">{post.id}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} /> {new Date(post.date).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  <h2 className="font-heading font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
