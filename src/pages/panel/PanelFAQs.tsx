import { useState, useEffect, useCallback } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { faqsApi, type FAQFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, HelpCircle, X, GripVertical, Search, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';
import { useDragReorder } from '@/hooks/useDragReorder';
import { StaggerList, StaggerItem } from '@/components/panel/StaggerList';
import { usePanelPagination } from '@/hooks/usePanelPagination';
import Pagination from '@/components/Pagination';

const PanelFAQs = () => {
  const { token } = useAuth();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [faqs, setFaqs] = useState<FAQFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<FAQFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const handleReorder = useCallback(async (reordered: FAQFromAPI[]) => {
    if (!token) return;
    try {
      await Promise.all(reordered.map((faq, i) => faqsApi.update(faq.id, { ...faq, sort_order: i }, token)));
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error guardando orden');
      fetchData();
    }
  }, [token]);

  const { getDragProps, isDragOver } = useDragReorder({ items: faqs, setItems: setFaqs, onReorder: handleReorder });

  const fetchData = () => {
    if (!token) return;
    faqsApi.listAll(token).then(setFaqs).catch(() => toast.error('Error cargando FAQs'));
  };

  useEffect(fetchData, [token]);

  const moveItem = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= faqs.length) return;
    const reordered = [...faqs];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    reordered.forEach((f, i) => (f.sort_order = i));
    setFaqs(reordered);
    await handleReorder(reordered);
  };

  const filtered = faqs.filter(f =>
    !filter || f.question.toLowerCase().includes(filter.toLowerCase()) || f.answer.replace(/<[^>]*>/g, '').toLowerCase().includes(filter.toLowerCase())
  );
  const { page, setPage, totalPages, paged } = usePanelPagination(filtered);
  const handleSave = async () => {
    if (!editing || !token) return;
    setLoading(true);
    try {
      if (editing.id) {
        await faqsApi.update(editing.id, editing, token);
        toast.success('FAQ actualizada');
      } else {
        await faqsApi.create(editing, token);
        toast.success('FAQ creada');
      }
      setEditing(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !(await confirm('¿Eliminar esta pregunta?', 'Se eliminará permanentemente esta FAQ.'))) return;
    try {
      await faqsApi.delete(id, token);
      toast.success('FAQ eliminada');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{faqs.length} preguntas</p>
          </div>
          <Button size="sm" onClick={() => setEditing({ question: '', answer: '', sort_order: faqs.length, is_active: 1 })}>
            <Plus size={16} /> Nueva
          </Button>
        </div>

        {/* Filter */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar preguntas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl mx-auto my-8">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-semibold text-base">{editing.id ? 'Editar pregunta' : 'Nueva pregunta'}</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Pregunta</label>
                  <Input value={editing.question || ''} onChange={(e) => setEditing({ ...editing, question: e.target.value })} placeholder="¿Cuál es la pregunta?" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Respuesta</label>
                  <RichEditor value={editing.answer || ''} onChange={(html) => setEditing({ ...editing, answer: html })} />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                  <Switch checked={!!editing.is_active} onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked ? 1 : 0 })} />
                  <Label className="text-sm">Activa</Label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <StaggerList className="space-y-1">
          {faqs.length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-border">
              <HelpCircle size={32} className="mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No hay preguntas frecuentes</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Aparecerán en el landing antes del CTA</p>
            </div>
          )}
          {paged.map((f) => {
            const realIdx = faqs.indexOf(f);
            return (
              <StaggerItem
                key={f.id}
                {...getDragProps(realIdx)}
                className={`flex items-center gap-3 p-4 rounded-xl bg-card border transition-all duration-150 group ${
                  isDragOver(realIdx) ? 'border-primary/40 shadow-md shadow-primary/5 scale-[1.01]' : 'border-border hover:border-primary/15'
                }`}
              >
                <GripVertical size={16} className="text-muted-foreground/30 shrink-0 cursor-grab active:cursor-grabbing" />
                <div className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                  <HelpCircle size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.question}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5" dangerouslySetInnerHTML={{ __html: f.answer.replace(/<[^>]*>/g, '').slice(0, 80) }} />
                </div>
                {!f.is_active && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium shrink-0">Inactiva</span>
                )}
                {!filter && (
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => moveItem(realIdx, -1)} disabled={realIdx === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronUp size={14} /></button>
                    <button onClick={() => moveItem(realIdx, 1)} disabled={realIdx === faqs.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20 text-muted-foreground"><ChevronDown size={14} /></button>
                  </div>
                )}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(f)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={15} /></button>
                  <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
                </div>
              </StaggerItem>
            );
          })}
          {faqs.length > 0 && filtered.length === 0 && (
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

export default PanelFAQs;
