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
  addExpense as addExpenseToState,
  addSale as addSaleToState,
  deleteExpense as deleteExpenseFromState,
  deleteSale as deleteSaleFromState,
  ExpenseUpdate,
  SaleUpdate,
  updateExpense as updateExpenseInState,
  updateSale as updateSaleInState,
} from "./state";
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
  shouldPersistStoredState,
  STORAGE_KEY,
} from "./storage";

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  selectedMonth: SelectedMonth;
  changeMonth: (offset: -1 | 1) => void;
  addSale: (sale: Omit<Sale, "id">) => void;
  updateSale: (id: string, sale: SaleUpdate) => void;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: ExpenseUpdate) => void;
  deleteExpense: (id: string) => void;
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
  const [initialReadOk, setInitialReadOk] = useState<boolean | null>(null);
  const [hasUserChanges, setHasUserChanges] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const migration = migrateStoredState(raw);
      setState(migration.state);
      setInitialReadOk(migration.ok);

      if (!migration.ok || migration.discarded > 0) {
        try {
          backupCorruptedStoredState(raw, window.localStorage);
        } catch (error) {
          console.error("Não foi possível preservar o backup dos dados locais.", error);
        }
      }
    } catch (error) {
      setInitialReadOk(false);
      console.error("Não foi possível ler os dados locais.", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldPersistStoredState(initialReadOk, hasUserChanges)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Não foi possível salvar os dados locais.", error);
    }
  }, [state, initialReadOk, hasUserChanges]);

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

  const addSale = (sale: Omit<Sale, "id">) => {
    const newSale: Sale = { ...sale, id: crypto.randomUUID() };
    const nextState = addSaleToState(state, newSale);
    setState((previous) =>
      previous === state ? nextState : addSaleToState(previous, newSale)
    );
    setSelectedMonth(getCurrentMonth(new Date(sale.date)));
    setHasUserChanges(true);
  };

  const updateSale = (id: string, sale: SaleUpdate) => {
    const nextState = updateSaleInState(state, id, sale);
    if (nextState === state) return;
    setState((previous) =>
      previous === state ? nextState : updateSaleInState(previous, id, sale)
    );
    setSelectedMonth(getCurrentMonth(new Date(sale.date)));
    setHasUserChanges(true);
  };

  const deleteSale = (id: string) => {
    const nextState = deleteSaleFromState(state, id);
    if (nextState === state) return;
    setState((previous) =>
      previous === state ? nextState : deleteSaleFromState(previous, id)
    );
    setHasUserChanges(true);
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    const nextState = addExpenseToState(state, newExpense);
    setState((previous) =>
      previous === state ? nextState : addExpenseToState(previous, newExpense)
    );
    setSelectedMonth(getCurrentMonth(new Date(expense.date)));
    setHasUserChanges(true);
  };

  const updateExpense = (id: string, expense: ExpenseUpdate) => {
    const nextState = updateExpenseInState(state, id, expense);
    if (nextState === state) return;
    setState((previous) =>
      previous === state ? nextState : updateExpenseInState(previous, id, expense)
    );
    setSelectedMonth(getCurrentMonth(new Date(expense.date)));
    setHasUserChanges(true);
  };

  const deleteExpense = (id: string) => {
    const nextState = deleteExpenseFromState(state, id);
    if (nextState === state) return;
    setState((previous) =>
      previous === state ? nextState : deleteExpenseFromState(previous, id)
    );
    setHasUserChanges(true);
  };

  const finishOnboarding = () => {
    setState((prev) => ({ ...prev, onboarded: true }));
    setHasUserChanges(true);
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
    updateSale,
    deleteSale,
    addExpense,
    updateExpense,
    deleteExpense,
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
