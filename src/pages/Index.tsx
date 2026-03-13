import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import CountersSection from "@/components/home/CountersSection";
import ClientsSection from "@/components/home/ClientsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <CountersSection />
      <ClientsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
