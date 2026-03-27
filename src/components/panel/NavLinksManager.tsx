import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface NavLink {
  index: number;
  labelKey: string;
  pathKey: string;
  visibleKey: string;
  orderKey: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
  defaultPath: string;
}

const defaultLinks = [
  { index: 1, defaultPath: '/', defaultLabel: 'Inicio' },
  { index: 2, defaultPath: '/#servicios', defaultLabel: 'Servicios' },
  { index: 3, defaultPath: '/sobre-nosotros', defaultLabel: 'Sobre Nosotros' },
  { index: 4, defaultPath: '/blog', defaultLabel: 'Blog' },
  { index: 5, defaultPath: '/contacto', defaultLabel: 'Contacto' },
  { index: 6, defaultPath: '/casos', defaultLabel: 'Casos de Éxito' },
];

interface Props {
  contents: Record<string, ContentFromAPI>;
  editValues: Record<string, string>;
  setEditValues: (vals: Record<string, string>) => void;
}

const NavLinksManager = ({ contents, editValues, setEditValues }: Props) => {
  const { token } = useAuth();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLElement | null>(null);

  const links: NavLink[] = defaultLinks.map(d => ({
    index: d.index,
    labelKey: `nav_link${d.index}_label`,
    pathKey: `nav_link${d.index}_path`,
    visibleKey: `nav_link${d.index}_visible`,
    orderKey: `nav_link${d.index}_order`,
    label: editValues[`nav_link${d.index}_label`] || d.defaultLabel,
    path: editValues[`nav_link${d.index}_path`] || d.defaultPath,
    visible: (editValues[`nav_link${d.index}_visible`] ?? 'true') !== 'false',
    order: parseInt(editValues[`nav_link${d.index}_order`] || String(d.index)) || d.index,
    defaultPath: d.defaultPath,
  })).sort((a, b) => a.order - b.order);

  const handleToggleVisibility = (link: NavLink) => {
    const newVal = link.visible ? 'false' : 'true';
    setEditValues({ ...editValues, [link.visibleKey]: newVal });
  };

  const handleLabelChange = (link: NavLink, newLabel: string) => {
    setEditValues({ ...editValues, [link.labelKey]: newLabel });
  };

  const handlePathChange = (link: NavLink, newPath: string) => {
    setEditValues({ ...editValues, [link.pathKey]: newPath });
  };

  const handleDragStart = useCallback((idx: number, e: React.DragEvent) => {
    setDragIdx(idx);
    dragNodeRef.current = e.currentTarget as HTMLElement;
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4';
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const sorted = [...links];
    const [moved] = sorted.splice(dragIdx, 1);
    sorted.splice(overIdx, 0, moved);

    const newEditValues = { ...editValues };
    sorted.forEach((link, i) => {
      newEditValues[link.orderKey] = String(i + 1);
    });
    setEditValues(newEditValues);

    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx, links, editValues, setEditValues]);

  const handleDragOver = useCallback((idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  }, []);

  const handleSaveAll = async () => {
    if (!token) return;
    try {
      const promises: Promise<any>[] = [];
      for (const link of links) {
        promises.push(
          contentsApi.update(link.labelKey, editValues[link.labelKey] || '', token, contents[link.labelKey]?.title),
          contentsApi.update(link.pathKey, editValues[link.pathKey] || link.defaultPath, token, `Enlace ${link.index} - Ruta`),
          contentsApi.update(link.visibleKey, editValues[link.visibleKey] ?? 'true', token, contents[link.visibleKey]?.title),
          contentsApi.update(link.orderKey, editValues[link.orderKey] ?? String(link.index), token, contents[link.orderKey]?.title),
        );
      }
      if (editValues['nav_cta_text'] !== undefined) {
        promises.push(contentsApi.update('nav_cta_text', editValues['nav_cta_text'], token, contents['nav_cta_text']?.title));
      }
      await Promise.all(promises);
      toast.success('Navegación actualizada correctamente');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {links.map((link, idx) => (
          <div
            key={link.index}
            draggable
            onDragStart={(e) => handleDragStart(idx, e)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(idx, e)}
            onDragEnter={(e) => e.preventDefault()}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-grab active:cursor-grabbing ${
              link.visible
                ? 'bg-background border-border'
                : 'bg-muted/30 border-border/50 opacity-60'
            } ${overIdx === idx && dragIdx !== null && dragIdx !== idx ? 'border-primary/40 bg-primary/5' : ''}`}
          >
            <GripVertical size={16} className="text-muted-foreground shrink-0" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
              <input
                value={editValues[link.labelKey] || ''}
                onChange={(e) => handleLabelChange(link, e.target.value)}
                placeholder="Etiqueta"
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-36"
              />
              <input
                value={editValues[link.pathKey] || link.defaultPath}
                onChange={(e) => handlePathChange(link, e.target.value)}
                placeholder="/ruta"
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-44"
              />
            </div>

            <Switch
              checked={link.visible}
              onCheckedChange={() => handleToggleVisibility(link)}
            />
          </div>
        ))}
      </div>

      {/* CTA Button text */}
      <div className="p-3 rounded-xl bg-background border border-border">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Botón CTA del navbar</label>
        <input
          value={editValues['nav_cta_text'] || ''}
          onChange={(e) => setEditValues({ ...editValues, nav_cta_text: e.target.value })}
          className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <Button variant="default" onClick={handleSaveAll} className="w-full">
        <Save size={14} className="mr-2" /> Guardar navegación
      </Button>
    </div>
  );
};

export default NavLinksManager;