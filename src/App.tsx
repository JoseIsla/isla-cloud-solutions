import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CMSProvider } from "@/hooks/useCMS";
import { AnimatePresence, motion } from "framer-motion";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";

// Eager: landing page (critical path)
import Index from "./pages/Index";

// Lazy: public pages
const ServiciosPage = lazy(() => import("./pages/Servicios"));
const ServicioDetalle = lazy(() => import("./pages/ServicioDetalle"));
const SobreNosotros = lazy(() => import("./pages/SobreNosotros"));
const BlogPage = lazy(() => import("./pages/Blog"));
const BlogDetalle = lazy(() => import("./pages/BlogDetalle"));
const ContactoPage = lazy(() => import("./pages/Contacto"));
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const AvisoLegal = lazy(() => import("./pages/AvisoLegal"));
const Casos = lazy(() => import("./pages/Casos"));
const CasoDetalle = lazy(() => import("./pages/CasoDetalle"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy: admin panel
const PanelLogin = lazy(() => import("./pages/panel/PanelLogin"));
const PanelDashboard = lazy(() => import("./pages/panel/PanelDashboard"));
const PanelServicios = lazy(() => import("./pages/panel/PanelServicios"));
const PanelNoticias = lazy(() => import("./pages/panel/PanelNoticias"));
const PanelContactos = lazy(() => import("./pages/panel/PanelContactos"));
const PanelContenidos = lazy(() => import("./pages/panel/PanelContenidos"));
const PanelClientes = lazy(() => import("./pages/panel/PanelClientes"));
const PanelCasos = lazy(() => import("./pages/panel/PanelCasos"));
const PanelTestimonios = lazy(() => import("./pages/panel/PanelTestimonios"));
const PanelFAQs = lazy(() => import("./pages/panel/PanelFAQs"));
const PanelMedios = lazy(() => import("./pages/panel/PanelMedios"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  </div>
);

const pageTransition = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-hero flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-hero-foreground">Cargando...</motion.div>
    </div>
  );
  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div key="login" {...pageTransition}>
          <PanelLogin />
        </motion.div>
      ) : (
        <motion.div key="panel" {...pageTransition}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/servicios" element={<ServiciosPage />} />
      <Route path="/servicios/:slug" element={<ServicioDetalle />} />
      <Route path="/sobre-nosotros" element={<SobreNosotros />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetalle />} />
      <Route path="/contacto" element={<ContactoPage />} />
      <Route path="/privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/legal" element={<AvisoLegal />} />
      <Route path="/casos" element={<Casos />} />
      <Route path="/casos/:id" element={<CasoDetalle />} />

      {/* Admin Panel */}
      <Route path="/panel" element={<ProtectedRoute><PanelDashboard /></ProtectedRoute>} />
      <Route path="/panel/servicios" element={<ProtectedRoute><PanelServicios /></ProtectedRoute>} />
      <Route path="/panel/noticias" element={<ProtectedRoute><PanelNoticias /></ProtectedRoute>} />
      <Route path="/panel/contactos" element={<ProtectedRoute><PanelContactos /></ProtectedRoute>} />
      <Route path="/panel/contenidos" element={<ProtectedRoute><PanelContenidos /></ProtectedRoute>} />
      <Route path="/panel/clientes" element={<ProtectedRoute><PanelClientes /></ProtectedRoute>} />
      <Route path="/panel/casos" element={<ProtectedRoute><PanelCasos /></ProtectedRoute>} />
      <Route path="/panel/testimonios" element={<ProtectedRoute><PanelTestimonios /></ProtectedRoute>} />
      <Route path="/panel/faqs" element={<ProtectedRoute><PanelFAQs /></ProtectedRoute>} />
      <Route path="/panel/medios" element={<ProtectedRoute><PanelMedios /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CMSProvider>
            <ScrollToTop />
            <AppRoutes />
            <CookieBanner />
          </CMSProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
