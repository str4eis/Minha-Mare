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

const STORAGE_KEY = "minha-mare:v1";
const DEMO_SALE_IDS = new Set(["s1", "s2", "s3", "s4", "s5"]);
const DEMO_EXPENSE_IDS = new Set(["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9"]);
const emptyState: AppState = {
  userName: "",
  onboarded: false,
  sales: [],
  expenses: [],
  metaAposentadoria: 0,
  poupancaAposentadoria: 0,
};

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
  const [state, setState] = useState<AppState>(emptyState);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(getCurrentMonth);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const storedState = JSON.parse(raw) as AppState;
        setState({
          ...storedState,
          userName: storedState.userName === "Maria da Maré" ? "" : storedState.userName,
          sales: storedState.sales.filter((sale) => !DEMO_SALE_IDS.has(sale.id)),
          expenses: storedState.expenses.filter(
            (expense) => !DEMO_EXPENSE_IDS.has(expense.id)
          ),
          metaAposentadoria:
            storedState.metaAposentadoria === 500 ? 0 : storedState.metaAposentadoria,
          poupancaAposentadoria:
            storedState.poupancaAposentadoria === 225 ? 0 : storedState.poupancaAposentadoria,
        });
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
