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
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppState, Expense, Sale } from "./types";
import { computeTotals, getCurrentMonth, SelectedMonth } from "./period";
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
import { ExpenseUpdate, SaleUpdate } from "./state";
import type { Database } from "./supabase/database.types";

interface StoreContextValue {
  state: AppState;
  userId: string | null;
  userEmail: string;
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
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: ExpenseUpdate) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  saveProfile: (profile: {
    full_name: string;
    retirement_goal: number;
    retirement_saved: number;
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

const StoreContext = createContext<StoreContextValue | null>(null);

function emptyState(): AppState {
  return {
    userName: "",
    onboarded: false,
    sales: [],
    expenses: [],
    metaAposentadoria: 0,
    poupancaAposentadoria: 0,
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
  const [state, setState] = useState<AppState>(emptyState);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(getCurrentMonth);
  const [hydrated, setHydrated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configurationError, setConfigurationError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [dataRefreshCount, setDataRefreshCount] = useState(0);
  const requestId = useRef(0);

  const getClient = useCallback(() => {
    if (!clientRef.current) clientRef.current = createClient();
    return clientRef.current;
  }, []);

  const acceptUser = useCallback((user: {
    id: string;
    email?: string;
  } | null) => {
    const nextUserId = user?.id ?? null;
    if (activeUserId.current !== nextUserId) {
      activeUserId.current = nextUserId;
      setState(emptyState());
      setError(null);
      setHydrated(false);
    }
    setUserId(nextUserId);
    setUserEmail(user?.email ?? "");
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
          userName: profile.full_name,
          onboarded: true,
          sales,
          expenses,
          metaAposentadoria: profile.retirement_goal,
          poupancaAposentadoria: profile.retirement_saved,
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
      try {
        await deleteSaleById(getClient(), id);
        setState((current) => ({
          ...current,
          sales: current.sales.filter((item) => item.id !== id),
        }));
        setError(null);
      } catch {
        setError("Não foi possível excluir a venda. Tente novamente.");
        throw new Error("Não foi possível excluir a venda. Tente novamente.");
      }
    },
    [getClient]
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
      try {
        await deleteExpenseById(getClient(), id);
        setState((current) => ({
          ...current,
          expenses: current.expenses.filter((item) => item.id !== id),
        }));
        setError(null);
      } catch {
        setError("Não foi possível excluir o gasto. Tente novamente.");
        throw new Error("Não foi possível excluir o gasto. Tente novamente.");
      }
    },
    [getClient]
  );

  const saveProfile = useCallback(
    async (profile: {
      full_name: string;
      retirement_goal: number;
      retirement_saved: number;
    }) => {
      if (!userId) throw new Error("Entre novamente para salvar seu perfil.");
      try {
        const savedProfile = await upsertProfile(getClient(), userId, profile);
        setState((current) => ({
          ...current,
          userName: savedProfile.full_name,
          metaAposentadoria: savedProfile.retirement_goal,
          poupancaAposentadoria: savedProfile.retirement_saved,
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
    setUserEmail("");
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
    userEmail,
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
