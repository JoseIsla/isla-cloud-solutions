import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import defaultLogo from "@/assets/logos/logotipo-blanco-small.png";
import { useCMSValue } from "@/hooks/useCMS";

const Navbar = () => {
  const navbarLogoUrl = useCMSValue('site_logo_navbar', '');
  const logo = navbarLogoUrl || defaultLogo;
  const nav1 = useCMSValue('nav_link1_label', 'Inicio');
  const nav2 = useCMSValue('nav_link2_label', 'Servicios');
  const nav3 = useCMSValue('nav_link3_label', 'Sobre Nosotros');
  const nav4 = useCMSValue('nav_link4_label', 'Blog');
  const nav5 = useCMSValue('nav_link5_label', 'Contacto');
  const nav6 = useCMSValue('nav_link6_label', 'Casos de Éxito');
  const navCta = useCMSValue('nav_cta_text', 'Solicitar Consulta');

  const path1 = useCMSValue('nav_link1_path', '/');
  const path2 = useCMSValue('nav_link2_path', '/#servicios');
  const path3 = useCMSValue('nav_link3_path', '/sobre-nosotros');
  const path4 = useCMSValue('nav_link4_path', '/blog');
  const path5 = useCMSValue('nav_link5_path', '/contacto');
  const path6 = useCMSValue('nav_link6_path', '/casos');

  const vis1 = useCMSValue('nav_link1_visible', 'true');
  const vis2 = useCMSValue('nav_link2_visible', 'true');
  const vis3 = useCMSValue('nav_link3_visible', 'true');
  const vis4 = useCMSValue('nav_link4_visible', 'true');
  const vis5 = useCMSValue('nav_link5_visible', 'true');
  const vis6 = useCMSValue('nav_link6_visible', 'true');

  const ord1 = useCMSValue('nav_link1_order', '1');
  const ord2 = useCMSValue('nav_link2_order', '2');
  const ord3 = useCMSValue('nav_link3_order', '3');
  const ord4 = useCMSValue('nav_link4_order', '4');
  const ord5 = useCMSValue('nav_link5_order', '5');
  const ord6 = useCMSValue('nav_link6_order', '6');

  const allLinks = [
    { label: nav1, path: path1, visible: vis1 !== 'false', order: parseInt(ord1) || 1 },
    { label: nav2, path: path2, visible: vis2 !== 'false', order: parseInt(ord2) || 2 },
    { label: nav3, path: path3, visible: vis3 !== 'false', order: parseInt(ord3) || 3 },
    { label: nav4, path: path4, visible: vis4 !== 'false', order: parseInt(ord4) || 4 },
    { label: nav5, path: path5, visible: vis5 !== 'false', order: parseInt(ord5) || 5 },
    { label: nav6, path: path6, visible: vis6 !== 'false', order: parseInt(ord6) || 6 },
  ];

  const navLinks = useMemo(
    () => allLinks.filter(l => l.visible).sort((a, b) => a.order - b.order),
    [nav1, nav2, nav3, nav4, nav5, nav6, path1, path2, path3, path4, path5, path6, vis1, vis2, vis3, vis4, vis5, vis6, ord1, ord2, ord3, ord4, ord5, ord6]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fully transparent when on hero (home + not scrolled + mobile menu closed)
  const isTransparent = isHome && !scrolled && !isOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-hero/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/10"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Isla Cloud Solutions" className="h-14 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isHash = link.path.startsWith("/#");
              const isActive = isHash
                ? location.pathname === "/" && location.hash === link.path.slice(1)
                : location.pathname === link.path;

              const handleClick = (e: React.MouseEvent) => {
                if (isHash) {
                  e.preventDefault();
                  const id = link.path.slice(2);
                  if (isHome) {
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate("/");
                    setTimeout(() => {
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    }, 300);
                  }
                }
              };

              return (
                <Link
                  key={link.path}
                  to={isHash ? "/" : link.path}
                  onClick={handleClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <Button variant="hero" size="default" asChild>
              <Link to="/contacto">{navCta}</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 border-t border-white/10 mt-2 pt-4 bg-hero/95 backdrop-blur-md -mx-4 px-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isHash = link.path.startsWith("/#");
                const handleMobileClick = (e: React.MouseEvent) => {
                  setIsOpen(false);
                  if (isHash) {
                    e.preventDefault();
                    const id = link.path.slice(2);
                    if (isHome) {
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      navigate("/");
                      setTimeout(() => {
                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                      }, 300);
                    }
                  }
                };
                return (
                  <Link
                    key={link.path}
                    to={isHash ? "/" : link.path}
                    onClick={handleMobileClick}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "text-white bg-white/15"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Button variant="hero" size="default" className="mt-2" asChild>
                <Link to="/contacto" onClick={() => setIsOpen(false)}>
                  {navCta}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
