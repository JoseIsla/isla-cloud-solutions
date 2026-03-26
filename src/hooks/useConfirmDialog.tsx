import { useState, useCallback } from "react";
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
    resolve: ((v: boolean) => void) | null;
  }>({ open: false, title: "", description: "", resolve: null });

  const confirm = useCallback(
    (title: string, description = "Esta acción no se puede deshacer.") =>
      new Promise<boolean>((resolve) => {
        setState({ open: true, title, description, resolve });
      }),
    []
  );

  const handleResponse = useCallback(
    (accepted: boolean) => {
      state.resolve?.(accepted);
      setState((s) => ({ ...s, open: false, resolve: null }));
    },
    [state.resolve]
  );

  const ConfirmDialog = () => (
    <AlertDialog open={state.open} onOpenChange={(open) => !open && handleResponse(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          <AlertDialogDescription>{state.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleResponse(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleResponse(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, ConfirmDialog };
}
