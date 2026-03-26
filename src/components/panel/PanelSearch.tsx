import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  servicesApi, newsApi, contactsApi, clientsApi, casesApi, testimonialsApi, faqsApi,
  type ServiceFromAPI, type NewsFromAPI, type ContactFromAPI, type ClientFromAPI,
  type CaseFromAPI, type TestimonialFromAPI, type FAQFromAPI,
} from '@/lib/api';
import {
  Search, X, FileText, Newspaper, MessageSquare, Users, Trophy, MessageCircle, HelpCircle,
} from 'lucide-react';

interface SearchResult {
  type: string;
  icon: any;
  label: string;
  subtitle: string;
  href: string;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  Servicio: { icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
  Noticia: { icon: Newspaper, color: 'text-sky-500 bg-sky-500/10' },
  Contacto: { icon: MessageSquare, color: 'text-rose-500 bg-rose-500/10' },
  Cliente: { icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
  Caso: { icon: Trophy, color: 'text-amber-500 bg-amber-500/10' },
  Testimonio: { icon: MessageCircle, color: 'text-violet-500 bg-violet-500/10' },
  FAQ: { icon: HelpCircle, color: 'text-teal-500 bg-teal-500/10' },
};

const PanelSearch = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [allData, setAllData] = useState<SearchResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load all data once when opened
  const loadData = useCallback(async () => {
    if (loaded || !token) return;
    try {
      const [services, news, contacts, clients, cases, testimonials, faqs] = await Promise.all([
        servicesApi.list().catch(() => [] as ServiceFromAPI[]),
        newsApi.list(token).catch(() => [] as NewsFromAPI[]),
        contactsApi.list(token).catch(() => [] as ContactFromAPI[]),
        clientsApi.list().catch(() => [] as ClientFromAPI[]),
        casesApi.list(token).catch(() => [] as CaseFromAPI[]),
        testimonialsApi.listAll(token).catch(() => [] as TestimonialFromAPI[]),
        faqsApi.listAll(token).catch(() => [] as FAQFromAPI[]),
      ]);

      const items: SearchResult[] = [
        ...services.map((s) => ({ type: 'Servicio', icon: FileText, label: s.title, subtitle: s.short_title || s.slug, href: '/panel/servicios' })),
        ...news.map((n) => ({ type: 'Noticia', icon: Newspaper, label: n.title, subtitle: n.category || n.slug, href: '/panel/noticias' })),
        ...contacts.map((c) => ({ type: 'Contacto', icon: MessageSquare, label: c.nombre, subtitle: c.email, href: '/panel/contactos' })),
        ...clients.map((c) => ({ type: 'Cliente', icon: Users, label: c.name, subtitle: c.website_url || '', href: '/panel/clientes' })),
        ...cases.map((c) => ({ type: 'Caso', icon: Trophy, label: c.title, subtitle: c.client_name, href: '/panel/casos' })),
        ...testimonials.map((t) => ({ type: 'Testimonio', icon: MessageCircle, label: t.author_name, subtitle: `${t.author_role} · ${t.author_company}`, href: '/panel/testimonios' })),
        ...faqs.map((f) => ({ type: 'FAQ', icon: HelpCircle, label: f.question, subtitle: f.answer.substring(0, 60) + '...', href: '/panel/faqs' })),
      ];
      setAllData(items);
      setLoaded(true);
    } catch { /* ignore */ }
  }, [token, loaded]);

  useEffect(() => {
    if (open) {
      loadData();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open, loadData]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }
    const q = query.toLowerCase();
    const filtered = allData.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 12));
    setSelectedIdx(0);
  }, [query, allData]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    navigate(result.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      handleSelect(results[selectedIdx]);
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border hover:bg-muted text-muted-foreground text-sm transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:inline text-xs">Buscar...</span>
        <kbd className="hidden md:inline text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-mono text-muted-foreground/60">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
          <div
            ref={containerRef}
            className="w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar servicios, noticias, contactos, casos..."
                className="flex-1 py-4 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-muted">
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query && results.length === 0 && (
                <div className="p-8 text-center">
                  <Search size={24} className="mx-auto mb-2 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No se encontraron resultados</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Prueba con otro término</p>
                </div>
              )}
              {!query && !loaded && (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground animate-pulse">Cargando datos...</p>
                </div>
              )}
              {!query && loaded && (
                <div className="p-6 text-center">
                  <p className="text-xs text-muted-foreground/50">Escribe para buscar entre {allData.length} elementos</p>
                </div>
              )}
              {results.map((result, idx) => {
                const cfg = typeConfig[result.type];
                const Icon = cfg?.icon || Search;
                const colorClass = cfg?.color || 'text-muted-foreground bg-muted';
                return (
                  <button
                    key={`${result.type}-${result.label}-${idx}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      idx === selectedIdx ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground/50 bg-muted px-2 py-0.5 rounded shrink-0">
                      {result.type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground/40">
              <span><kbd className="font-mono bg-muted px-1 rounded">↑↓</kbd> navegar</span>
              <span><kbd className="font-mono bg-muted px-1 rounded">↵</kbd> seleccionar</span>
              <span><kbd className="font-mono bg-muted px-1 rounded">esc</kbd> cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PanelSearch;
