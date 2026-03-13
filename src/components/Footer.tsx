import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy text-hero-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl mb-4">
              Isla Cloud <span className="text-primary">Solutions</span>
            </h3>
            <p className="text-hero-foreground/60 text-sm leading-relaxed mb-6">
              Tu socio tecnológico de confianza. Más de 20 años de experiencia en soluciones IT para empresas.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Servicios
            </h4>
            <ul className="space-y-2 text-sm text-hero-foreground/60">
              <li><Link to="/servicios/cloud-servers" className="hover:text-primary transition-colors">Cloud Servers</Link></li>
              <li><Link to="/servicios/hosting" className="hover:text-primary transition-colors">Hosting Profesional</Link></li>
              <li><Link to="/servicios/administracion-it" className="hover:text-primary transition-colors">Administración IT</Link></li>
              <li><Link to="/servicios/desarrollo-web" className="hover:text-primary transition-colors">Desarrollo Web</Link></li>
              <li><Link to="/servicios/seguridad" className="hover:text-primary transition-colors">Seguridad IT</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Empresa
            </h4>
            <ul className="space-y-2 text-sm text-hero-foreground/60">
              <li><Link to="/sobre-nosotros" className="hover:text-primary transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Noticias</Link></li>
              <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-hero-foreground/60">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                <span>info@islacloudsolutions.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                <span>+34 900 000 000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5" />
                <span>España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-hero-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-hero-foreground/40 text-xs">
            © {new Date().getFullYear()} Isla Cloud Solutions. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-hero-foreground/40">
            <Link to="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link>
            <Link to="/legal" className="hover:text-primary transition-colors">Aviso Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
