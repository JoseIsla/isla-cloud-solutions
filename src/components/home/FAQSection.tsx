import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCMSValue } from '@/hooks/useCMS';
import { faqsApi, type FAQFromAPI } from '@/lib/api';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQFromAPI[]>([]);

  const sectionLabel = useCMSValue('faq_section_label', 'FAQ');
  const sectionTitle = useCMSValue('faq_section_title', 'Preguntas frecuentes');
  const sectionSubtitle = useCMSValue(
    'faq_section_subtitle',
    'Resolvemos las dudas más habituales sobre nuestros servicios.'
  );

  useEffect(() => {
    faqsApi.list().then(setFaqs).catch(() => {});
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
            <HelpCircle size={14} />
            {sectionLabel}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.id}
                value={`faq-${faq.id}`}
                className="border border-border rounded-xl px-5 data-[state=open]:bg-muted/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-[15px] font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
