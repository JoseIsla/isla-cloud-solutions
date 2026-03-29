import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import usePageMeta from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";

const PoliticaCookies = () => {
  usePageMeta({
    title: "Política de Cookies",
    description: "Política de cookies de Isla Cloud Solutions. Conoce cómo utilizamos las cookies en nuestro sitio web.",
    canonical: "/cookies",
  });

  const content = useCMSValue('legal_cookies_content', '');

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', path: '/' }, { name: 'Política de Cookies', path: '/cookies' }]} />
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground">
              Política de Cookies
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {content ? (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3 [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground [&_table]:w-full [&_table]:text-sm [&_table]:border [&_table]:border-border [&_th]:p-3 [&_th]:text-left [&_th]:text-foreground [&_th]:font-medium [&_th]:bg-secondary/50 [&_td]:p-3 [&_td]:border-t [&_td]:border-border [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
                />
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p>Contenido no disponible. Configúralo desde el panel de administración.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PoliticaCookies;
