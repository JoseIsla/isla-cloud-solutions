import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CMSProvider } from "@/hooks/useCMS";
import { AnimatePresence, motion } from "framer-motion";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index";
import ServiciosPage from "./pages/Servicios";
import ServicioDetalle from "./pages/ServicioDetalle";
import SobreNosotros from "./pages/SobreNosotros";
import BlogPage from "./pages/Blog";
import BlogDetalle from "./pages/BlogDetalle";
import ContactoPage from "./pages/Contacto";
import NotFound from "./pages/NotFound";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import AvisoLegal from "./pages/AvisoLegal";
import CasoDetalle from "./pages/CasoDetalle";
import PanelLogin from "./pages/panel/PanelLogin";
import PanelDashboard from "./pages/panel/PanelDashboard";
import PanelServicios from "./pages/panel/PanelServicios";
import PanelNoticias from "./pages/panel/PanelNoticias";
import PanelContactos from "./pages/panel/PanelContactos";
import PanelContenidos from "./pages/panel/PanelContenidos";
import PanelClientes from "./pages/panel/PanelClientes";
import PanelCasos from "./pages/panel/PanelCasos";
import PanelTestimonios from "./pages/panel/PanelTestimonios";
import PanelFAQs from "./pages/panel/PanelFAQs";
const queryClient = new QueryClient();

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

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CMSProvider>
            <AppRoutes />
            <CookieBanner />
          </CMSProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
