import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import usePageMeta from "@/hooks/usePageMeta";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { useCMSValue } from "@/hooks/useCMS";
import { sanitizeHTML } from "@/lib/sanitize";

const FALLBACK_CONTENT = `<h2>Información General</h2>
<div class="p-6 rounded-2xl bg-card border border-border mb-8">
<p><strong>Titular:</strong> Isla Cloud Solutions, S.L. (en adelante ISLACLOUD)</p>
<p><strong>Dirección:</strong> Avda. de las Lagunas, 31 – 28981 Parla (Madrid)</p>
<p><strong>Contacto:</strong> <a href="mailto:info@islacloudsolutions.com">info@islacloudsolutions.com</a> · +34 91 088 96 13</p>
<p><strong>Datos registrales:</strong> Registro Mercantil de Madrid – Tomo 37662, Folio 130, Inscripción 1, Hoja M-671063</p>
<p><strong>CIF/NIF:</strong> B88102519</p>
</div>
<p>ISLACLOUD no puede asumir ninguna responsabilidad derivada del uso incorrecto, inapropiado o ilícito de la información aparecida en las páginas de Internet de ISLACLOUD.</p>`;

const AvisoLegal = () => {
  usePageMeta({
    title: "Aviso Legal",
    description: "Aviso legal e información corporativa de Isla Cloud Solutions, S.L.",
    canonical: "/legal",
  });

  const content = useCMSValue('legal_aviso_content', '');
  const displayContent = content || FALLBACK_CONTENT;

  return (
    <Layout>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', path: '/' }, { name: 'Aviso Legal', path: '/legal' }]} />
      <section className="bg-hero grid-pattern py-24">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-hero-foreground">
              Aviso Legal
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3 [&_a]:text-primary [&_a:hover]:underline [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(displayContent) }}
              />
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AvisoLegal;
