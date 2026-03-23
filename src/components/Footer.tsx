import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Github } from "lucide-react";
import defaultFooterLogo from "@/assets/logos/logotipo-blanco-small.png";
import { useEffect, useState } from "react";
import { servicesApi, type ServiceFromAPI } from "@/lib/api";

const Footer = () => {
  const footerLogoUrl = useCMSValue('site_logo_footer', '');
  const footerLogo = footerLogoUrl || defaultFooterLogo;
  const description = useCMSValue('footer_description', 'Tu socio tecnológico de confianza. Más de 20 años de experiencia en soluciones IT para empresas.');
  const contactEmail = useCMSValue('contact_email', 'info@islacloudsolutions.com');
  const contactPhone = useCMSValue('contact_phone', '+34 900 000 000');
  const contactAddress = useCMSValue('contact_address', 'España');
  const footerServicesTitle = useCMSValue('footer_services_title', 'Servicios');
  const footerCompanyTitle = useCMSValue('footer_company_title', 'Empresa');
  const footerContactTitle = useCMSValue('footer_contact_title', 'Contacto');
  const footerCompanyLink1 = useCMSValue('footer_company_link1', 'Sobre Nosotros');
  const footerCompanyLink2 = useCMSValue('footer_company_link2', 'Noticias');
  const footerCompanyLink3 = useCMSValue('footer_company_link3', 'Contacto');
  const footerLegal1 = useCMSValue('footer_legal_link1', 'Política de Privacidad');
  const footerLegal2 = useCMSValue('footer_legal_link2', 'Aviso Legal');
  const footerCopyright = useCMSValue('footer_copyright', '© {year} Isla Cloud Solutions. Todos los derechos reservados.');

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
            <img src={footerLogo} alt="Isla Cloud Solutions" className="h-10 w-auto mb-4" />
            <p className="text-hero-foreground/60 text-sm leading-relaxed mb-6">
              {description}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              {footerServicesTitle}
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
              {footerCompanyTitle}
            </h4>
            <ul className="space-y-2 text-sm text-hero-foreground/60">
              <li><Link to="/sobre-nosotros" className="hover:text-primary transition-colors">{footerCompanyLink1}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">{footerCompanyLink2}</Link></li>
              <li><Link to="/contacto" className="hover:text-primary transition-colors">{footerCompanyLink3}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              {footerContactTitle}
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
            {footerCopyright.replace('{year}', String(new Date().getFullYear()))}
          </p>
          <div className="flex gap-6 text-xs text-hero-foreground/40">
            <Link to="/privacidad" className="hover:text-primary transition-colors">{footerLegal1}</Link>
            <Link to="/legal" className="hover:text-primary transition-colors">{footerLegal2}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
