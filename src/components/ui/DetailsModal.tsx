"use client";

import { X } from "lucide-react";

interface DetailsModalProps {
  title: string;
  fields: Array<{ label: string; value: string }>;
  onClose: () => void;
}

export default function DetailsModal({
  title,
  fields,
  onClose,
}: DetailsModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-details-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="entry-details-title"
            className="text-xl font-semibold text-mare-institutional"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-mare-slate hover:bg-black/5"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <dl className="mt-4 divide-y divide-black/5">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-start justify-between gap-4 py-3"
            >
              <dt className="text-base text-mare-slate">{field.label}</dt>
              <dd className="text-right text-lg font-medium text-mare-ink">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
