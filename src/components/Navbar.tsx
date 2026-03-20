import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useCMSValue } from "@/hooks/useCMS";

const Navbar = () => {
  const nav1 = useCMSValue('nav_link1_label', 'Inicio');
  const nav2 = useCMSValue('nav_link2_label', 'Servicios');
  const nav3 = useCMSValue('nav_link3_label', 'Sobre Nosotros');
  const nav4 = useCMSValue('nav_link4_label', 'Blog');
  const nav5 = useCMSValue('nav_link5_label', 'Contacto');
  const navCta = useCMSValue('nav_cta_text', 'Solicitar Consulta');

  const navLinks = [
    { label: nav1, path: "/" },
    { label: nav2, path: "/#servicios" },
    { label: nav3, path: "/sobre-nosotros" },
    { label: nav4, path: "/blog" },
    { label: nav5, path: "/contacto" },
  ];

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
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Isla Cloud Solutions" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-white font-heading font-bold text-lg leading-tight">
                Isla Cloud
              </span>
              <span className="text-white/60 text-xs font-body tracking-wider uppercase">
                Solutions
              </span>
            </div>
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
