"use client";

import { useEffect, useId, useRef, type RefObject } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  returnFocusRef,
  fallbackFocusRef,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      const returnTarget = returnFocusRef.current?.isConnected
        ? returnFocusRef.current
        : fallbackFocusRef?.current;
      returnTarget?.focus();
    }
  }, [open, returnFocusRef, fallbackFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-xl2 border-0 bg-white p-0 text-mare-ink shadow-soft backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-lg text-mare-slate">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="min-h-14 rounded-full border border-black/10 px-4 text-lg font-semibold text-mare-slate hover:bg-mare-card"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-14 rounded-full bg-mare-negative px-4 text-lg font-semibold text-white hover:opacity-90"
          >
            Excluir
          </button>
        </div>
      </div>
    </dialog>
  );
}
