import { useMemo, lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import usePageMeta, { SITE_URL, SITE_NAME } from "@/hooks/usePageMeta";
import HeroSection from "@/components/home/HeroSection";
import IntroSection from "@/components/home/IntroSection";

// Lazy load below-fold sections for faster initial paint
const ServicesSection = lazy(() => import("@/components/home/ServicesSection"));
const WhyUsSection = lazy(() => import("@/components/home/WhyUsSection"));
const CountersSection = lazy(() => import("@/components/home/CountersSection"));
const ClientsSection = lazy(() => import("@/components/home/ClientsSection"));
const TestimonialsSection = lazy(() => import("@/components/home/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

const SectionFallback = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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
      <Suspense fallback={<SectionFallback />}>
        <ServicesSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <WhyUsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CountersSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ClientsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FAQSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CTASection />
      </Suspense>
    </Layout>
  );
};

export default Index;
