import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { faqsApi, type FAQFromAPI } from '@/lib/api';
import PanelLayout from './PanelLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, HelpCircle, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';

const PanelFAQs = () => {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState<FAQFromAPI[]>([]);
  const [editing, setEditing] = useState<Partial<FAQFromAPI> | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const fetchData = () => {
    if (!token) return;
    faqsApi.listAll(token).then(setFaqs).catch(() => toast.error('Error cargando FAQs'));
  };

  useEffect(fetchData, [token]);

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
    if (!token || !confirm('¿Eliminar esta pregunta?')) return;
    try {
      await faqsApi.delete(id, token);
      toast.success('FAQ eliminada');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDragStart = (idx: number, e: React.DragEvent<HTMLDivElement>) => {
    setDragIdx(idx);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // Make ghost semi-transparent
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4';
    });
  };

  const handleDragEnd = async () => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    if (dragIdx === null || overIdx === null || dragIdx === overIdx || !token) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const reordered = [...faqs];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(overIdx, 0, moved);

    // Optimistic UI update
    setFaqs(reordered);
    setDragIdx(null);
    setOverIdx(null);

    // Persist new order
    try {
      await Promise.all(
        reordered.map((faq, i) =>
          faqsApi.update(faq.id, { ...faq, sort_order: i }, token)
        )
      );
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error guardando orden');
      fetchData(); // rollback
    }
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIdx !== idx) setOverIdx(idx);
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              {faqs.length} preguntas · <span className="text-muted-foreground/60">Arrastra para reordenar</span>
            </p>
          </div>
          <Button size="sm" onClick={() => setEditing({ question: '', answer: '', sort_order: faqs.length, is_active: 1 })}>
            <Plus size={16} /> Nueva
          </Button>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Orden</label>
                    <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border w-full">
                      <Switch checked={!!editing.is_active} onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked ? 1 : 0 })} />
                      <Label className="text-sm">Activa</Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {faqs.length === 0 && (
            <div className="p-12 text-center rounded-xl border border-dashed border-border">
              <HelpCircle size={32} className="mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No hay preguntas frecuentes</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Aparecerán en el landing antes del CTA</p>
            </div>
          )}
          {faqs.map((f, idx) => (
            <div
              key={f.id}
              draggable
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(idx, e)}
              onDragEnter={(e) => e.preventDefault()}
              className={`flex items-center gap-3 p-4 rounded-xl bg-card border transition-all duration-150 group ${
                overIdx === idx && dragIdx !== null && dragIdx !== idx
                  ? 'border-primary/40 shadow-md shadow-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/15'
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
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(f)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Edit size={15} /></button>
                <button onClick={() => handleDelete(f.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelLayout>
  );
};

export default PanelFAQs;
