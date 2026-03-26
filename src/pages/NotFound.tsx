import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import usePageMeta from "@/hooks/usePageMeta";

const NotFound = () => {
  const location = useLocation();

  usePageMeta({
    title: "Página no encontrada",
    description: "La página que buscas no existe o ha sido movida.",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <p className="text-8xl font-heading font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <Button variant="hero" asChild>
            <Link to="/">
              <ArrowLeft size={16} className="mr-2" /> Volver al inicio
            </Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
};

export default NotFound;
