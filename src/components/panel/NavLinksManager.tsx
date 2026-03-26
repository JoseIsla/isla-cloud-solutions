import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contentsApi, type ContentFromAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface NavLink {
  index: number;
  labelKey: string;
  visibleKey: string;
  orderKey: string;
  label: string;
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

  const links: NavLink[] = defaultLinks.map(d => ({
    index: d.index,
    labelKey: `nav_link${d.index}_label`,
    visibleKey: `nav_link${d.index}_visible`,
    orderKey: `nav_link${d.index}_order`,
    label: editValues[`nav_link${d.index}_label`] || d.defaultLabel,
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

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const sorted = [...links];
    const current = sorted[idx];
    const above = sorted[idx - 1];
    setEditValues({
      ...editValues,
      [current.orderKey]: String(above.order),
      [above.orderKey]: String(current.order),
    });
  };

  const handleMoveDown = (idx: number) => {
    if (idx === links.length - 1) return;
    const sorted = [...links];
    const current = sorted[idx];
    const below = sorted[idx + 1];
    setEditValues({
      ...editValues,
      [current.orderKey]: String(below.order),
      [below.orderKey]: String(current.order),
    });
  };

  const handleSaveAll = async () => {
    if (!token) return;
    try {
      const promises: Promise<any>[] = [];
      for (const link of links) {
        promises.push(
          contentsApi.update(link.labelKey, editValues[link.labelKey] || '', token, contents[link.labelKey]?.title),
          contentsApi.update(link.visibleKey, editValues[link.visibleKey] ?? 'true', token, contents[link.visibleKey]?.title),
          contentsApi.update(link.orderKey, editValues[link.orderKey] ?? String(link.index), token, contents[link.orderKey]?.title),
        );
      }
      // Save CTA too
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
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              link.visible
                ? 'bg-background border-border'
                : 'bg-muted/30 border-border/50 opacity-60'
            }`}
          >
            <GripVertical size={16} className="text-muted-foreground shrink-0" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
              <input
                value={editValues[link.labelKey] || ''}
                onChange={(e) => handleLabelChange(link, e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-40"
              />
              <span className="text-xs text-muted-foreground font-mono truncate">
                {link.defaultPath}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ArrowUp size={14} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => handleMoveDown(idx)}
                disabled={idx === links.length - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ArrowDown size={14} className="text-muted-foreground" />
              </button>
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
