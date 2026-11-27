"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/domain/categories";
import {
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
} from "@/lib/domain/types";

type ExpenseCategory = FishingExpenseCategory | HomeExpenseCategory;

function NovoGastoContent() {
  const params = useSearchParams();
  const kind: ExpenseKind = params.get("kind") === "casa" ? "casa" : "pesca";
  const meta = kind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const categories = Object.keys(meta) as ExpenseCategory[];
  const initialCategory = categories.find(
    (category) => category === params.get("categoria")
  );

  return <ExpenseForm kind={kind} initialCategory={initialCategory} />;
}

export default function NovoGastoPage() {
  return (
    <Suspense fallback={null}>
      <NovoGastoContent />
    </Suspense>
  );
}
