import { useMemo } from "react";
import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import CountersSection from "@/components/home/CountersSection";
import ClientsSection from "@/components/home/ClientsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustSection from "@/components/home/TrustSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  const websiteJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Servicios IT profesionales: hosting, cloud, desarrollo web, consultoría, seguridad y mantenimiento informático.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }), []);

  usePageMeta({
    title: 'Isla Cloud Solutions',
    description: 'Servicios IT profesionales: hosting, cloud, desarrollo web, consultoría, seguridad y mantenimiento informático. Tu socio tecnológico de confianza.',
    canonical: '/',
    jsonLd: websiteJsonLd,
  });

  return (
    <Layout>
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <WhyUsSection />
      <CountersSection />
      <ClientsSection />
      <TestimonialsSection />
      <TrustSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
