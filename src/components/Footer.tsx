import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCMSValue } from "@/hooks/useCMS";
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Github } from "lucide-react";
import defaultFooterLogo from "@/assets/logos/logotipo-blanco-small.png";
import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "@/lib/api";
import { useT } from "@/i18n/LanguageContext";

const Footer = () => {
  const t = useT();
  const footerLogoUrl = useCMSValue('site_logo_footer', '');
  const footerLogo = footerLogoUrl || defaultFooterLogo;
  const description = useCMSValue('footer_description', '') || t('footer.description');
  const contactEmail = useCMSValue('contact_email', 'info@islacloudsolutions.com');
  const contactPhone = useCMSValue('contact_phone', '+34 900 000 000');
  const contactAddress = useCMSValue('contact_address', 'España');
  const footerServicesTitle = useCMSValue('footer_services_title', '') || t('footer.services');
  const footerCompanyTitle = useCMSValue('footer_company_title', '') || t('footer.company');
  const footerContactTitle = useCMSValue('footer_contact_title', '') || t('footer.contact');
  const footerCompanyLink1 = useCMSValue('footer_company_link1', '') || t('footer.about');
  const footerCompanyLink2 = useCMSValue('footer_company_link2', '') || t('footer.news');
  const footerCompanyLink3 = useCMSValue('footer_company_link3', '') || t('footer.contact');
  const footerLegal1 = useCMSValue('footer_legal_link1', '') || t('footer.privacy');
  const footerLegal2 = useCMSValue('footer_legal_link2', '') || t('footer.legal');
  const footerLegal3 = useCMSValue('footer_legal_link3', '') || t('footer.cookies');
  const footerCopyright = useCMSValue('footer_copyright', '') || t('footer.copyright');

  const legalPrivacidadVisible = useCMSValue('legal_privacidad_visible', 'true');
  const legalAvisoVisible = useCMSValue('legal_aviso_visible', 'true');
  const legalCookiesVisible = useCMSValue('legal_cookies_visible', 'true');

  const socialLinkedin = useCMSValue('social_linkedin', '');
  const socialTwitter = useCMSValue('social_twitter', '');
  const socialFacebook = useCMSValue('social_facebook', '');
  const socialInstagram = useCMSValue('social_instagram', '');
  const socialYoutube = useCMSValue('social_youtube', '');
  const socialGithub = useCMSValue('social_github', '');

  const socialLinks = [
    { url: socialLinkedin, icon: Linkedin, label: 'LinkedIn' },
    { url: socialTwitter, icon: Twitter, label: 'Twitter' },
    { url: socialFacebook, icon: Facebook, label: 'Facebook' },
    { url: socialInstagram, icon: Instagram, label: 'Instagram' },
    { url: socialYoutube, icon: Youtube, label: 'YouTube' },
    { url: socialGithub, icon: Github, label: 'GitHub' },
  ].filter(s => s.url);

  const legalLinks = [
    { visible: legalPrivacidadVisible === 'true', to: '/privacidad', label: footerLegal1 },
    { visible: legalAvisoVisible === 'true', to: '/legal', label: footerLegal2 },
    { visible: legalCookiesVisible === 'true', to: '/cookies', label: footerLegal3 },
  ].filter(l => l.visible);

  const { data: apiServices } = useQuery({
    queryKey: ['services-footer'],
    queryFn: () => servicesApi.list(),
    staleTime: 10 * 60 * 1000,
  });

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
    <footer className="relative bg-hero overflow-hidden">
      {/* Silk crease divider */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(to right, transparent, hsla(0, 0%, 100%, 0.10) 50%, transparent)',
      }} />

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

          {/* Col 1: Brand */}
          <div className="lg:col-span-4 flex flex-col gap-6 pr-4">
            <p className="text-sm leading-relaxed max-w-[35ch] text-balance" style={{ color: 'hsla(0, 0%, 100%, 0.40)' }}>
              {description}
            </p>
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-5 mt-2">
                {socialLinks.map(({ url, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="transition-colors duration-500"
                    style={{ color: 'hsla(0, 0%, 100%, 0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'hsl(var(--primary))')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.35)')}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Services */}
          <div className="lg:col-span-2 lg:col-start-6 flex flex-col gap-5">
            <h4 className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'hsla(0, 0%, 100%, 0.40)' }}>
              {footerServicesTitle}
            </h4>
            <ul className="flex flex-col gap-3">
              {serviceLinks.map(s => (
                <li key={s.slug}>
                  <Link
                    to={`/servicios/${s.slug}`}
                    className="text-sm font-light transition-colors duration-500"
                    style={{ color: 'hsla(0, 0%, 100%, 0.55)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'hsl(var(--primary))')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.55)')}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <h4 className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'hsla(0, 0%, 100%, 0.40)' }}>
              {footerCompanyTitle}
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { to: '/sobre-nosotros', label: footerCompanyLink1 },
                { to: '/blog', label: footerCompanyLink2 },
                { to: '/casos', label: t('footer.cases') },
                { to: '/contacto', label: footerCompanyLink3 },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-light transition-colors duration-500"
                    style={{ color: 'hsla(0, 0%, 100%, 0.55)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'hsl(var(--primary))')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.55)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <h4 className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'hsla(0, 0%, 100%, 0.40)' }}>
              {footerContactTitle}
            </h4>
            <div className="flex flex-col gap-4 text-sm font-light">
              <div>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 transition-colors duration-500"
                  style={{ color: 'hsla(0, 0%, 100%, 0.55)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(var(--primary))')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.55)')}
                >
                  <Mail size={14} style={{ color: 'hsl(var(--primary))' }} />
                  {contactEmail}
                </a>
              </div>
              <div>
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-2 transition-colors duration-500"
                  style={{ color: 'hsla(0, 0%, 100%, 0.55)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsl(var(--primary))')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.55)')}
                >
                  <Phone size={14} style={{ color: 'hsl(var(--primary))' }} />
                  {contactPhone}
                </a>
              </div>
              <div className="flex items-start gap-2" style={{ color: 'hsla(0, 0%, 100%, 0.55)' }}>
                <MapPin size={14} className="mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
                <span>{contactAddress}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom legal bar */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
          style={{ borderTop: '1px solid hsla(0, 0%, 100%, 0.05)' }}
        >
          <div className="flex items-center gap-4">
            <img src={footerLogo} alt="Isla Cloud Solutions" className="h-12 w-auto max-w-[220px] object-contain" />
            <p className="text-xs" style={{ color: 'hsla(0, 0%, 100%, 0.30)' }}>
              {footerCopyright.replace('{year}', String(new Date().getFullYear()))}
            </p>
          </div>
          {legalLinks.length > 0 && (
            <div className="flex gap-8">
              {legalLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs transition-colors duration-500"
                  style={{ color: 'hsla(0, 0%, 100%, 0.30)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.70)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsla(0, 0%, 100%, 0.30)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
