import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ServiciosPage from "./pages/Servicios";
import ServicioDetalle from "./pages/ServicioDetalle";
import SobreNosotros from "./pages/SobreNosotros";
import BlogPage from "./pages/Blog";
import ContactoPage from "./pages/Contacto";
import NotFound from "./pages/NotFound";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import AvisoLegal from "./pages/AvisoLegal";
import PanelLogin from "./pages/panel/PanelLogin";
import PanelDashboard from "./pages/panel/PanelDashboard";
import PanelServicios from "./pages/panel/PanelServicios";
import PanelNoticias from "./pages/panel/PanelNoticias";
import PanelContactos from "./pages/panel/PanelContactos";
import PanelContenidos from "./pages/panel/PanelContenidos";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-hero flex items-center justify-center"><div className="text-hero-foreground">Cargando...</div></div>;
  if (!user) return <PanelLogin />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/servicios" element={<ServiciosPage />} />
    <Route path="/servicios/:slug" element={<ServicioDetalle />} />
    <Route path="/sobre-nosotros" element={<SobreNosotros />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/contacto" element={<ContactoPage />} />
    
    {/* Admin Panel - NO public link */}
    <Route path="/panel" element={<ProtectedRoute><PanelDashboard /></ProtectedRoute>} />
    <Route path="/panel/servicios" element={<ProtectedRoute><PanelServicios /></ProtectedRoute>} />
    <Route path="/panel/noticias" element={<ProtectedRoute><PanelNoticias /></ProtectedRoute>} />
    <Route path="/panel/contactos" element={<ProtectedRoute><PanelContactos /></ProtectedRoute>} />
    <Route path="/panel/contenidos" element={<ProtectedRoute><PanelContenidos /></ProtectedRoute>} />

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
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
