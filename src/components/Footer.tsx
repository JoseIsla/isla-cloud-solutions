import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";
import { useEffect, useState } from "react";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";

const Footer = () => {
  const description = useCMSValue('footer_description', 'Tu socio tecnológico de confianza. Más de 20 años de experiencia en soluciones IT para empresas.');
  const contactEmail = useCMSValue('contact_email', 'info@islacloudsolutions.com');
  const contactPhone = useCMSValue('contact_phone', '+34 900 000 000');
  const contactAddress = useCMSValue('contact_address', 'España');

  const [apiServices, setApiServices] = useState<ServiceFromAPI[] | null>(null);

  useEffect(() => {
    servicesApi.list()
      .then(setApiServices)
      .catch(() => setApiServices(null));
  }, []);

  const serviceLinks = apiServices && apiServices.length > 0
    ? apiServices.slice(0, 5).map(s => ({ label: s.short_title || s.title, slug: s.slug }))
    : [
        { label: "Cloud Servers", slug: "cloud-servers" },
        { label: "Hosting Profesional", slug: "hosting" },
        { label: "Administración IT", slug: "administracion-it" },
        { label: "Desarrollo Web", slug: "desarrollo-web" },
        { label: "Seguridad IT", slug: "seguridad" },
      ];

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
              {description}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Servicios
            </h4>
            <ul className="space-y-2 text-sm text-hero-foreground/60">
              {serviceLinks.map(s => (
                <li key={s.slug}>
                  <Link to={`/servicios/${s.slug}`} className="hover:text-primary transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
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
                <span>{contactEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5" />
                <span>{contactAddress}</span>
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
