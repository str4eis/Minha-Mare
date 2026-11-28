"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AppState, Expense, Sale } from "./domain/types";
import { computeTotals, getCurrentMonth, SelectedMonth } from "./domain/period";
import { createClient } from "./supabase/client";
import {
  deleteExpenseById,
  insertExpense,
  listExpensesForMonth,
  updateExpenseById,
} from "./data/expenses";
import {
  deleteSaleById,
  insertSale,
  listSalesForMonth,
  updateSaleById,
} from "./data/sales";
import { getProfile, upsertProfile } from "./data/profile";
import {
  ExpenseUpdate,
  restoreExpense,
  restoreSale,
  SaleUpdate,
} from "./domain/state";
import type { Database } from "./supabase/database.types";
import { getProfileDisplayName } from "./domain/profile-name";

interface StoreContextValue {
  state: AppState;
  userId: string | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  ready: boolean;
  retry: () => void;
  refreshData: () => void;
  selectedMonth: SelectedMonth;
  changeMonth: (offset: -1 | 1) => void;
  selectMonthForDate: (date: string) => void;
  addSale: (sale: Omit<Sale, "id">) => Promise<void>;
  updateSale: (id: string, sale: SaleUpdate) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  undoDelete: () => void;
  undoNotice: string | null;
  flushPendingDeletion: () => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: ExpenseUpdate) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  saveProfile: (profile: {
    full_name: string;
  }) => Promise<void>;
  clearUserData: () => void;
  totals: {
    totalVendido: number;
    totalGastosPesca: number;
    totalGastosCasa: number;
    totalGastos: number;
    resultado: number;
  };
}

type PendingDeletion =
  | {
      kind: "sale";
      item: Sale;
      month: SelectedMonth;
      userId: string;
      timer: number | null;
      commit: Promise<boolean> | null;
    }
  | {
      kind: "expense";
      item: Expense;
      month: SelectedMonth;
      userId: string;
      timer: number | null;
      commit: Promise<boolean> | null;
    };

const StoreContext = createContext<StoreContextValue | null>(null);

function emptyState(): AppState {
  return {
    userName: "",
    onboarded: false,
    sales: [],
    expenses: [],
  };
}

function monthForDate(date: string): SelectedMonth {
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) {
    throw new RangeError("A data do lançamento é inválida.");
  }
  return getCurrentMonth(parsed);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<SupabaseClient<Database> | null>(null);
  const activeUserId = useRef<string | null>(null);
  const pendingDeletionRef = useRef<PendingDeletion | null>(null);
  const [state, setState] = useState<AppState>(emptyState);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(getCurrentMonth);
  const selectedMonthRef = useRef(selectedMonth);
  const [hydrated, setHydrated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configurationError, setConfigurationError] = useState(false);
  const [undoNotice, setUndoNotice] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dataRefreshCount, setDataRefreshCount] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    selectedMonthRef.current = selectedMonth;
  }, [selectedMonth]);

  const getClient = useCallback(() => {
    if (!clientRef.current) clientRef.current = createClient();
    return clientRef.current;
  }, []);

  const commitPendingDeletion = useCallback(async (): Promise<boolean> => {
    const pending = pendingDeletionRef.current;
    if (!pending) return true;
    if (pending.commit) return pending.commit;

    if (pending.timer !== null) window.clearTimeout(pending.timer);
    setUndoNotice(null);

    pending.commit = (async () => {
      try {
        if (pending.kind === "sale") {
          await deleteSaleById(getClient(), pending.item.id);
        } else {
          await deleteExpenseById(getClient(), pending.item.id);
        }
        setError(null);
        return true;
      } catch {
        if (activeUserId.current === pending.userId) {
          const monthIsSelected =
            selectedMonthRef.current.year === pending.month.year &&
            selectedMonthRef.current.month === pending.month.month;
          if (pending.kind === "sale" && monthIsSelected) {
            setState((current) => restoreSale(current, pending.item));
            setError("Não foi possível excluir a venda. Ela voltou para a lista.");
          } else if (pending.kind === "expense" && monthIsSelected) {
            setState((current) => restoreExpense(current, pending.item));
            setError("Não foi possível excluir o gasto. Ele voltou para a lista.");
          } else {
            setError("Não foi possível concluir a exclusão. O lançamento continua salvo.");
          }
        }
        return false;
      } finally {
        if (pendingDeletionRef.current === pending) {
          pendingDeletionRef.current = null;
        }
      }
    })();

    return pending.commit;
  }, [getClient]);

  const undoDelete = useCallback(() => {
    const pending = pendingDeletionRef.current;
    if (!pending || pending.commit) return;

    if (pending.timer !== null) window.clearTimeout(pending.timer);
    pendingDeletionRef.current = null;
    setUndoNotice(null);
    if (activeUserId.current !== pending.userId) return;

    const monthIsSelected =
      selectedMonthRef.current.year === pending.month.year &&
      selectedMonthRef.current.month === pending.month.month;
    if (!monthIsSelected) {
      setSelectedMonth(pending.month);
      return;
    }

    if (pending.kind === "sale") {
      setState((current) => restoreSale(current, pending.item));
    } else {
      setState((current) => restoreExpense(current, pending.item));
    }
  }, []);

  const flushPendingDeletion = useCallback(async () => {
    if (!pendingDeletionRef.current) return;
    const committed = await commitPendingDeletion();
    if (!committed) {
      throw new Error("A exclusão não foi concluída. Tente novamente antes de sair.");
    }
  }, [commitPendingDeletion]);

  useEffect(
    () => () => {
      const pending = pendingDeletionRef.current;
      if (pending?.timer !== null && pending?.timer !== undefined) {
        window.clearTimeout(pending.timer);
      }
    },
    []
  );

  const acceptUser = useCallback((user: User | null) => {
    const nextUserId = user?.id ?? null;
    if (activeUserId.current !== nextUserId) {
      const pending = pendingDeletionRef.current;
      if (pending?.timer !== null && pending?.timer !== undefined) {
        window.clearTimeout(pending.timer);
      }
      pendingDeletionRef.current = null;
      setUndoNotice(null);
      activeUserId.current = nextUserId;
      setState(emptyState());
      setError(null);
      setHydrated(false);
    }
    setUserId(nextUserId);
    setAuthDisplayName(
      getProfileDisplayName("", user?.user_metadata, user?.email)
    );
  }, []);

  useEffect(() => {
    let client: SupabaseClient<Database>;
    try {
      client = getClient();
      setConfigurationError(false);
    } catch (clientError) {
      setError(
        clientError instanceof Error
          ? clientError.message
          : "Configure o acesso ao Supabase no arquivo .env.local."
      );
      setConfigurationError(true);
      setAuthChecked(true);
      setHydrated(true);
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      acceptUser(session?.user ?? null);
      setSessionCheckFailed(false);
      setAuthChecked(true);
    });

    setSessionCheckFailed(false);
    client.auth
      .getUser()
      .then(({ data, error: authError }) => {
        if (authError) throw authError;
        acceptUser(data.user);
        setSessionCheckFailed(false);
        setAuthChecked(true);
      })
      .catch(() => {
        setError("Não foi possível verificar sua sessão. Tente novamente.");
        setSessionCheckFailed(true);
        setHydrated(true);
        setLoading(false);
        setAuthChecked(true);
      });

    return () => subscription.unsubscribe();
  }, [acceptUser, getClient, retryCount]);

  useEffect(() => {
    if (!authChecked || configurationError || sessionCheckFailed) return;
    const currentRequest = ++requestId.current;
    let active = true;
    setLoading(true);
    setError(null);

    if (!userId) {
      setState(emptyState());
      setLoading(false);
      setHydrated(true);
      return () => {
        active = false;
      };
    }

    let client: SupabaseClient<Database>;
    try {
      client = getClient();
    } catch (clientError) {
      setError(
        clientError instanceof Error
          ? clientError.message
          : "Configure o acesso ao Supabase no arquivo .env.local."
      );
      setConfigurationError(true);
      setLoading(false);
      setHydrated(true);
      return;
    }

    Promise.all([
      getProfile(client, userId),
      listSalesForMonth(client, selectedMonth.year, selectedMonth.month),
      listExpensesForMonth(client, selectedMonth.year, selectedMonth.month),
    ])
      .then(([profile, sales, expenses]) => {
        if (!active || currentRequest !== requestId.current) return;
        setState({
          userName: profile.full_name.trim() || authDisplayName,
          onboarded: true,
          sales,
          expenses,
        });
        setHydrated(true);
        setLoading(false);
      })
      .catch(() => {
        if (!active || currentRequest !== requestId.current) return;
        setError("Não foi possível carregar seus dados. Tente novamente.");
        setHydrated(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    authChecked,
    authDisplayName,
    configurationError,
    dataRefreshCount,
    getClient,
    retryCount,
    selectedMonth,
    sessionCheckFailed,
    userId,
  ]);

  const changeMonth = useCallback((offset: -1 | 1) => {
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
  }, []);

  const selectMonthForDate = useCallback((date: string) => {
    setSelectedMonth(monthForDate(date));
  }, []);

  const addSale = useCallback(
    async (sale: Omit<Sale, "id">) => {
      try {
        const inserted = await insertSale(getClient(), sale);
        setState((current) => ({ ...current, sales: [inserted, ...current.sales] }));
        selectMonthForDate(inserted.date);
        setError(null);
      } catch {
        setError("Não foi possível salvar a venda. Tente novamente.");
        throw new Error("Não foi possível salvar a venda. Tente novamente.");
      }
    },
    [getClient, selectMonthForDate]
  );

  const updateSale = useCallback(
    async (id: string, sale: SaleUpdate) => {
      try {
        const updated = await updateSaleById(getClient(), id, sale);
        setState((current) => ({
          ...current,
          sales: [updated, ...current.sales.filter((item) => item.id !== id)],
        }));
        selectMonthForDate(updated.date);
        setError(null);
      } catch {
        setError("Não foi possível atualizar a venda. Tente novamente.");
        throw new Error("Não foi possível atualizar a venda. Tente novamente.");
      }
    },
    [getClient, selectMonthForDate]
  );

  const deleteSale = useCallback(
    async (id: string) => {
      const item = state.sales.find((sale) => sale.id === id);
      if (!item || !userId) return;
      if (pendingDeletionRef.current && !(await commitPendingDeletion())) return;

      setState((current) => ({
        ...current,
        sales: current.sales.filter((sale) => sale.id !== id),
      }));
      const pending: PendingDeletion = {
        kind: "sale",
        item,
        month: monthForDate(item.date),
        userId,
        timer: null,
        commit: null,
      };
      pendingDeletionRef.current = pending;
      setUndoNotice("Venda apagada.");
      pending.timer = window.setTimeout(() => {
        void commitPendingDeletion();
      }, 6_000);
    },
    [commitPendingDeletion, state.sales, userId]
  );

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id">) => {
      try {
        const inserted = await insertExpense(getClient(), expense);
        setState((current) => ({
          ...current,
          expenses: [inserted, ...current.expenses],
        }));
        selectMonthForDate(inserted.date);
        setError(null);
      } catch {
        setError("Não foi possível salvar o gasto. Tente novamente.");
        throw new Error("Não foi possível salvar o gasto. Tente novamente.");
      }
    },
    [getClient, selectMonthForDate]
  );

  const updateExpense = useCallback(
    async (id: string, expense: ExpenseUpdate) => {
      try {
        const updated = await updateExpenseById(getClient(), id, expense);
        setState((current) => ({
          ...current,
          expenses: [
            updated,
            ...current.expenses.filter((item) => item.id !== id),
          ],
        }));
        selectMonthForDate(updated.date);
        setError(null);
      } catch {
        setError("Não foi possível atualizar o gasto. Tente novamente.");
        throw new Error("Não foi possível atualizar o gasto. Tente novamente.");
      }
    },
    [getClient, selectMonthForDate]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const item = state.expenses.find((expense) => expense.id === id);
      if (!item || !userId) return;
      if (pendingDeletionRef.current && !(await commitPendingDeletion())) return;

      setState((current) => ({
        ...current,
        expenses: current.expenses.filter((expense) => expense.id !== id),
      }));
      const pending: PendingDeletion = {
        kind: "expense",
        item,
        month: monthForDate(item.date),
        userId,
        timer: null,
        commit: null,
      };
      pendingDeletionRef.current = pending;
      setUndoNotice("Gasto apagado.");
      pending.timer = window.setTimeout(() => {
        void commitPendingDeletion();
      }, 6_000);
    },
    [commitPendingDeletion, state.expenses, userId]
  );

  const saveProfile = useCallback(
    async (profile: {
      full_name: string;
    }) => {
      if (!userId) throw new Error("Entre novamente para salvar seu perfil.");
      try {
        const savedProfile = await upsertProfile(getClient(), userId, profile);
        setState((current) => ({
          ...current,
          userName: savedProfile.full_name,
        }));
        setError(null);
      } catch {
        throw new Error("Não foi possível salvar seu perfil. Tente novamente.");
      }
    },
    [getClient, userId]
  );

  const clearUserData = useCallback(() => {
    activeUserId.current = null;
    setUserId(null);
    setAuthDisplayName("");
    setState(emptyState());
    setError(null);
    setHydrated(false);
    setLoading(false);
    setSelectedMonth(getCurrentMonth());
  }, []);

  const totals = useMemo(
    () => computeTotals(state.sales, state.expenses),
    [state.sales, state.expenses]
  );

  const value: StoreContextValue = {
    state,
    userId,
    hydrated,
    loading,
    error,
    ready: hydrated && !loading && error === null,
    retry: () => setRetryCount((count) => count + 1),
    refreshData: () => setDataRefreshCount((count) => count + 1),
    selectedMonth,
    changeMonth,
    selectMonthForDate,
    addSale,
    updateSale,
    deleteSale,
    undoDelete,
    undoNotice,
    flushPendingDeletion,
    addExpense,
    updateExpense,
    deleteExpense,
    saveProfile,
    clearUserData,
    totals,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
