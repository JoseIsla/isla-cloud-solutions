import Layout from "@/components/Layout";
import usePageMeta from "@/hooks/usePageMeta";
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
  usePageMeta({
    title: 'Isla Cloud Solutions',
    description: 'Servicios IT profesionales: hosting, cloud, desarrollo web, consultoría, seguridad y mantenimiento informático. Tu socio tecnológico de confianza.',
    canonical: '/',
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
