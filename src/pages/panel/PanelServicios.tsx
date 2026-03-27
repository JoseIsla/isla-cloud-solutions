import { useEffect, useState, useRef, useCallback } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import MediaPicker from '@/components/panel/MediaPicker';
import { useAuth } from '@/hooks/useAuth';
import PanelLayout from './PanelLayout';
import { servicesApi, uploadImage, type ServiceFromAPI, API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X, Upload, GripVertical, FileText, Search, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, HelpCircle,
  Server, Shield, Cloud, Monitor, Globe, Smartphone, Lock, Wrench, Database, Cpu, HardDrive, Wifi, Mail, Settings, Code, BarChart3, Users, Zap, Eye, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';
import { useDragReorder } from '@/hooks/useDragReorder';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';
import { usePanelPagination } from '@/hooks/usePanelPagination';
import Pagination from '@/components/Pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'Server', label: 'Servidor', Icon: Server },
  { value: 'Shield', label: 'Seguridad', Icon: Shield },
  { value: 'Cloud', label: 'Cloud', Icon: Cloud },
  { value: 'Monitor', label: 'Monitor', Icon: Monitor },
  { value: 'Globe', label: 'Web', Icon: Globe },
  { value: 'Smartphone', label: 'Móvil', Icon: Smartphone },
  { value: 'Lock', label: 'Candado', Icon: Lock },
  { value: 'Wrench', label: 'Herramienta', Icon: Wrench },
  { value: 'Database', label: 'Base de datos', Icon: Database },
  { value: 'Cpu', label: 'Procesador', Icon: Cpu },
  { value: 'HardDrive', label: 'Disco duro', Icon: HardDrive },
  { value: 'Wifi', label: 'Red / WiFi', Icon: Wifi },
  { value: 'Mail', label: 'Correo', Icon: Mail },
  { value: 'Settings', label: 'Configuración', Icon: Settings },
  { value: 'Code', label: 'Código', Icon: Code },
  { value: 'BarChart3', label: 'Estadísticas', Icon: BarChart3 },
  { value: 'Users', label: 'Usuarios', Icon: Users },
  { value: 'Zap', label: 'Rendimiento', Icon: Zap },
  { value: 'Eye', label: 'Monitorización', Icon: Eye },
];

const PanelServicios = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [services, setServices] = useState<ServiceFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<ServiceFromAPI> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [mediaPicker, setMediaPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReorder = useCallback(async (reordered: ServiceFromAPI[]) => {
    if (!token) return;
    try {
      await Promise.all(reordered.map((s, i) => servicesApi.update(s.id, { ...s, sort_order: i }, token)));
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error guardando orden');
      load();
    }
  }, [token]);

  const { getDragProps, isDragOver } = useDragReorder({ items: services, setItems: setServices, onReorder: handleReorder });

  const load = () => { servicesApi.list().then(setServices).catch(() => {}); };
  useEffect(load, []);

  const moveItem = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= services.length) return;
    const reordered = [...services];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    reordered.forEach((s, i) => (s.sort_order = i));
    setServices(reordered);
    await handleReorder(reordered);
  };

  const moveToEdge = async (idx: number, target: 'first' | 'last') => {
    if (idx === (target === 'first' ? 0 : services.length - 1)) return;
    const reordered = [...services];
    const [moved] = reordered.splice(idx, 1);
    target === 'first' ? reordered.unshift(moved) : reordered.push(moved);
    reordered.forEach((s, i) => (s.sort_order = i));
    setServices(reordered);
    await handleReorder(reordered);
  };

  const filtered = services.filter(s =>
    !filter || s.title.toLowerCase().includes(filter.toLowerCase()) || s.slug.toLowerCase().includes(filter.toLowerCase())
  );
  const { page, setPage, totalPages, paged } = usePanelPagination(filtered);

  const handleSave = async () => {
    if (!token || !editing) return;
    try {
      if (isNew) {
        await servicesApi.create(editing, token);
        toast.success('Servicio creado');
      } else {
        await servicesApi.update(editing.id!, editing, token);
        toast.success('Servicio actualizado');
      }
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !(await confirm('¿Eliminar este servicio?', 'Se eliminará permanentemente este servicio.'))) return;
    try {
      await servicesApi.delete(id, token);
      toast.success('Servicio eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, token);
      const fullUrl = result.url.startsWith('http') ? result.url : `${API_BASE_URL}${result.url}`;
      setEditing(prev => prev ? { ...prev, image_url: fullUrl } : prev);
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err.message || 'Error subiendo imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Servicios</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{services.length} servicios</p>
          </div>
          <Button size="sm" onClick={() => { setEditing({ slug: '', title: '', short_title: '', description: '', long_description: '', icon: 'Server', features: [], image_url: '', sort_order: services.length }); setIsNew(true); }}>
            <Plus size={16} /> Nuevo
          </Button>
        </div>

        {/* Filter */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar servicios..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 min-h-screen">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl shadow-2xl my-8">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{isNew ? 'Nuevo servicio' : 'Editar servicio'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Título</label>
                    <input type="text" value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Título corto</label>
                    <input type="text" value={editing.short_title ?? ''} onChange={(e) => setEditing({ ...editing, short_title: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Slug (URL)
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle size={13} className="text-muted-foreground/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px] text-xs">
                            <p>El slug es la parte de la URL que identifica este servicio. Ej: <strong>administracion-it</strong> genera la ruta <strong>/servicios/administracion-it</strong>. Usa solo letras minúsculas, números y guiones.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    <input type="text" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Icono</label>
                    <Select value={editing.icon || 'Server'} onValueChange={(v) => setEditing({ ...editing, icon: v })}>
                      <SelectTrigger className="w-full h-[42px] text-sm">
                        <SelectValue>
                          {(() => {
                            const selected = ICON_OPTIONS.find(o => o.value === (editing.icon || 'Server'));
                            if (!selected) return 'Seleccionar';
                            return (
                              <span className="flex items-center gap-2">
                                <selected.Icon size={16} className="text-primary" />
                                {selected.label}
                              </span>
                            );
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[280px]">
                        {ICON_OPTIONS.map(({ value, label, Icon: OptIcon }) => (
                          <SelectItem key={value} value={value} className="text-sm">
                            <span className="flex items-center gap-2.5">
                              <OptIcon size={16} className="text-primary shrink-0" />
                              <span>{label}</span>
                              <span className="text-[10px] text-muted-foreground ml-auto">({value})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Imagen</label>
                  {editing.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-border inline-block">
                      <img src={editing.image_url} alt="" className="h-20 object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload size={14} /> {uploading ? 'Subiendo...' : 'Subir'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setMediaPicker(true)}>
                      Galería
                    </Button>
                    <input
                      type="text"
                      value={editing.image_url ?? ''}
                      onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                      placeholder="o pega URL..."
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                  <MediaPicker
                    open={mediaPicker}
                    onClose={() => setMediaPicker(false)}
                    onSelect={(url) => setEditing(prev => prev ? { ...prev, image_url: url } : prev)}
                    defaultCategory="servicios"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción corta</label>
                  <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descripción completa</label>
                  <RichEditor value={editing.long_description ?? ''} onChange={(html) => setEditing({ ...editing, long_description: html })} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Características (una por línea)</label>
                  <textarea value={(editing.features || []).join('\n')} onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n').filter(Boolean) })} rows={3} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave}>Guardar</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <StaggerList className="space-y-1">
          {paged.map((s, idx) => {
            const realIdx = services.indexOf(s);
            return (
              <StaggerItem
                key={s.id}
                {...getDragProps(realIdx)}
                className={`flex items-center gap-3 p-4 rounded-xl bg-card border transition-all duration-150 group ${
                  isDragOver(realIdx) ? 'border-primary/40 shadow-md shadow-primary/5 scale-[1.01]' : 'border-border hover:border-primary/15'
                }`}
              >
                <GripVertical size={16} className="text-muted-foreground/30 shrink-0 cursor-grab active:cursor-grabbing" />
                {s.image_url ? (
                  <img src={s.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.slug}</p>
                </div>
                {!filter && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveToEdge(realIdx, 'first')} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground" title="Mover al inicio"><ChevronsUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, -1)} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, 1)} disabled={realIdx === services.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronDown size={14} /></button>
                    <button onClick={() => moveToEdge(realIdx, 'last')} disabled={realIdx === services.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground" title="Mover al final"><ChevronsDown size={14} /></button>
                  </div>
                )}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(s); setIsNew(false); }} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
                </div>
              </StaggerItem>
            );
          })}
          {services.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No hay servicios registrados
            </div>
          )}
          {services.length > 0 && filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-dashed border-border">
              No se encontraron resultados para "{filter}"
            </div>
          )}
        </StaggerList>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <ConfirmDialog />
    </PanelLayout>
  );
};

export default PanelServicios;
