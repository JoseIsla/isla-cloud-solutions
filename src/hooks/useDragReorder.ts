import { useState, useRef, useCallback } from 'react';

interface UseDragReorderOptions<T extends { id: number; sort_order: number }> {
  items: T[];
  setItems: (items: T[]) => void;
  onReorder: (reordered: T[]) => Promise<void>;
}

export function useDragReorder<T extends { id: number; sort_order: number }>({
  items,
  setItems,
  onReorder,
}: UseDragReorderOptions<T>) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLElement | null>(null);

  const handleDragStart = useCallback((idx: number, e: React.DragEvent) => {
    setDragIdx(idx);
    dragNodeRef.current = e.currentTarget as HTMLElement;
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4';
    });
  }, []);

  const handleDragEnd = useCallback(async () => {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1';
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const reordered = [...items];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(overIdx, 0, moved);

    const withOrder = reordered.map((item, i) => ({ ...item, sort_order: i }));
    setItems(withOrder);
    setDragIdx(null);
    setOverIdx(null);

    await onReorder(withOrder);
  }, [dragIdx, overIdx, items, setItems, onReorder]);

  const handleDragOver = useCallback((idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  }, []);

  const getDragProps = useCallback((idx: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(idx, e),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => handleDragOver(idx, e),
    onDragEnter: (e: React.DragEvent) => e.preventDefault(),
  }), [handleDragStart, handleDragEnd, handleDragOver]);

  const isDragOver = useCallback((idx: number) =>
    overIdx === idx && dragIdx !== null && dragIdx !== idx,
  [overIdx, dragIdx]);

  return { getDragProps, isDragOver };
}
