"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Expense, Sale } from "./types";
import {
  computeTotals,
  filterByMonth,
  getCurrentMonth,
  SelectedMonth,
} from "./period";
import {
  backupCorruptedStoredState,
  createEmptyAppState,
  migrateStoredState,
  STORAGE_KEY,
} from "./storage";

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  selectedMonth: SelectedMonth;
  changeMonth: (offset: -1 | 1) => void;
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
  const [state, setState] = useState<AppState>(createEmptyAppState);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(getCurrentMonth);
  const [hydrated, setHydrated] = useState(false);
  const [canPersist, setCanPersist] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const migration = migrateStoredState(raw);
      setState(migration.state);
      setCanPersist(migration.ok);

      if (!migration.ok) {
        try {
          backupCorruptedStoredState(raw, window.localStorage);
        } catch (error) {
          console.error("Não foi possível preservar o backup dos dados locais.", error);
        }
      }
    } catch (error) {
      setCanPersist(false);
      console.error("Não foi possível ler os dados locais.", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !canPersist) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Não foi possível salvar os dados locais.", error);
    }
  }, [state, hydrated, canPersist]);

  const changeMonth = (offset: -1 | 1) => {
    setSelectedMonth((previous) => {
      const candidate =
        offset === -1
          ? previous.month === 1
            ? { year: previous.year - 1, month: 12 }
            : { year: previous.year, month: previous.month - 1 }
          : previous.month === 12
            ? { year: previous.year + 1, month: 1 }
            : { year: previous.year, month: previous.month + 1 };
      const current = getCurrentMonth();

      if (
        candidate.year < 1 ||
        candidate.year > current.year ||
        (candidate.year === current.year && candidate.month > current.month)
      ) {
        return previous;
      }

      return candidate;
    });
  };

  const addSale = (sale: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = {
      ...sale,
      id: `s${Date.now()}`,
      date: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, sales: [newSale, ...prev.sales] }));
    setCanPersist(true);
  };

  const addExpense = (expense: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expense,
      id: `e${Date.now()}`,
      date: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
    setCanPersist(true);
  };

  const finishOnboarding = () => {
    setState((prev) => ({ ...prev, onboarded: true }));
  };

  const totals = useMemo(() => {
    const sales = filterByMonth(state.sales, selectedMonth.year, selectedMonth.month);
    const expenses = filterByMonth(
      state.expenses,
      selectedMonth.year,
      selectedMonth.month
    );
    return computeTotals(sales, expenses);
  }, [state.sales, state.expenses, selectedMonth]);

  const value: StoreContextValue = {
    state,
    hydrated,
    selectedMonth,
    changeMonth,
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
