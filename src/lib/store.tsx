"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Expense, Sale } from "./types";

const STORAGE_KEY = "minha-mare:v1";

function daysAgoISO(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedState(): AppState {
  const sales: Sale[] = [
    {
      id: "s1",
      category: "peixe",
      buyer: "Restaurante do Mar",
      quantity: 4,
      unit: "kg",
      value: 120,
      date: daysAgoISO(0, 8, 30),
    },
    {
      id: "s2",
      category: "ostra",
      buyer: "Feira do Porto",
      quantity: 8,
      unit: "dz",
      value: 380,
      date: daysAgoISO(1, 15, 10),
    },
    {
      id: "s3",
      category: "marisco",
      buyer: "Dona Rita",
      quantity: 6,
      unit: "kg",
      value: 250,
      date: daysAgoISO(3, 9, 45),
    },
    {
      id: "s4",
      category: "caranguejo",
      buyer: "Sabor do Mar",
      quantity: 10,
      unit: "dz",
      value: 600,
      date: daysAgoISO(5, 17, 0),
    },
    {
      id: "s5",
      category: "sururu",
      buyer: "Cliente direto",
      quantity: 20,
      unit: "kg",
      value: 1100,
      date: daysAgoISO(8, 7, 20),
    },
  ];

  const expenses: Expense[] = [
    { id: "e1", kind: "pesca", category: "combustivel", description: "Gasolina do barco", value: 250, date: daysAgoISO(1, 7, 0) },
    { id: "e2", kind: "pesca", category: "transporte", description: "Frete até a feira", value: 120, date: daysAgoISO(2, 10, 0) },
    { id: "e3", kind: "pesca", category: "gelo", description: "Gelo para conservação", value: 90, date: daysAgoISO(3, 6, 30) },
    { id: "e4", kind: "pesca", category: "equipamentos", description: "Rede nova", value: 260, date: daysAgoISO(6, 14, 0) },
    { id: "e5", kind: "pesca", category: "manutencao", description: "Conserto do motor", value: 60, date: daysAgoISO(9, 11, 0) },
    { id: "e6", kind: "pesca", category: "iscas", description: "Iscas para caranguejo", value: 40, date: daysAgoISO(4, 8, 0) },
    { id: "e7", kind: "casa", category: "alimentacao", description: "Feira da semana", value: 250, date: daysAgoISO(2, 18, 0) },
    { id: "e8", kind: "casa", category: "moradia", description: "Conta de luz", value: 150, date: daysAgoISO(5, 19, 0) },
    { id: "e9", kind: "casa", category: "saude", description: "Farmácia", value: 50, date: daysAgoISO(7, 16, 0) },
  ];

  return {
    userName: "Maria da Maré",
    onboarded: false,
    sales,
    expenses,
    metaAposentadoria: 500,
    poupancaAposentadoria: 225,
  };
}

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  addSale: (sale: Omit<Sale, "id" | "date">) => void;
  addExpense: (expense: Omit<Expense, "id" | "date">) => void;
  finishOnboarding: () => void;
  totals: {
    totalVendido: number;
    totalGastosPesca: number;
    totalGastosCasa: number;
    totalGastos: number;
    resultado: number;
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw) as AppState);
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addSale = (sale: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = {
      ...sale,
      id: `s${Date.now()}`,
      date: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, sales: [newSale, ...prev.sales] }));
  };

  const addExpense = (expense: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expense,
      id: `e${Date.now()}`,
      date: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  const finishOnboarding = () => {
    setState((prev) => ({ ...prev, onboarded: true }));
  };

  const totals = useMemo(() => {
    const totalVendido = state.sales.reduce((acc, s) => acc + s.value, 0);
    const totalGastosPesca = state.expenses
      .filter((e) => e.kind === "pesca")
      .reduce((acc, e) => acc + e.value, 0);
    const totalGastosCasa = state.expenses
      .filter((e) => e.kind === "casa")
      .reduce((acc, e) => acc + e.value, 0);
    const totalGastos = totalGastosPesca + totalGastosCasa;
    const resultado = totalVendido - totalGastos;
    return { totalVendido, totalGastosPesca, totalGastosCasa, totalGastos, resultado };
  }, [state.sales, state.expenses]);

  const value: StoreContextValue = {
    state,
    hydrated,
    addSale,
    addExpense,
    finishOnboarding,
    totals,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
