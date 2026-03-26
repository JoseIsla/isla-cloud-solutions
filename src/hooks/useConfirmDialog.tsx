import { useState, useCallback, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({ open: false, title: "", description: "" });

  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (title: string, description = "Esta acción no se puede deshacer.") =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setState({ open: true, title, description });
      }),
    []
  );

  const handleResponse = useCallback((accepted: boolean) => {
    resolveRef.current?.(accepted);
    resolveRef.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  const ConfirmDialog = useCallback(
    () => (
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleResponse(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleResponse(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleResponse(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [state.open, state.title, state.description, handleResponse]
  );

  return { confirm, ConfirmDialog };
}
