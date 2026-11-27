import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense, Sale } from "../domain/types";
import type { Database } from "../supabase/database.types";
import { insertImportedExpenses, insertImportedSales } from "./local-import";

const sales: Array<Omit<Sale, "id">> = [
  {
    category: "peixe",
    buyer: "Compradora",
    quantity: 2,
    unit: "kg",
    value: 30,
    date: "2026-03-01T12:00:00.000Z",
  },
];

const expenses: Array<Omit<Expense, "id">> = [
  {
    kind: "pesca",
    category: "gelo",
    description: "Gelo",
    value: 10,
    date: "2026-03-01T12:00:00.000Z",
  },
];

function createMockClient() {
  const existing = {
    sales: new Set<string>(),
    expenses: new Set<string>(),
  };
  const inserts: Record<string, Array<Array<{ id?: string }>>> = {
    sales: [],
    expenses: [],
  };
  let failFirstExpenseInsert = true;

  const client = {
    from(table: "sales" | "expenses") {
      return {
        select() {
          return {
            in: async (_column: string, ids: string[]) => ({
              data: ids
                .filter((id) => existing[table].has(id))
                .map((id) => ({ id })),
              error: null,
            }),
          };
        },
        insert: async (rows: Array<{ id?: string }>) => {
          if (table === "expenses" && failFirstExpenseInsert) {
            failFirstExpenseInsert = false;
            return { error: new Error("temporary failure") };
          }
          inserts[table].push(rows);
          rows.forEach((row) => {
            if (row.id) existing[table].add(row.id);
          });
          return { error: null };
        },
      };
    },
  } as unknown as SupabaseClient<Database>;

  return { client, inserts };
}

describe("local data import batches", () => {
  it("does not reinsert sales after expenses fail and the import is retried", async () => {
    const { client, inserts } = createMockClient();
    const saleIds = ["00000000-0000-4000-8000-000000000001"];
    const expenseIds = ["00000000-0000-4000-8000-000000000002"];

    await insertImportedSales(client, sales, saleIds);
    await expect(
      insertImportedExpenses(client, expenses, expenseIds)
    ).rejects.toThrow("temporary failure");

    await insertImportedSales(client, sales, saleIds);
    await insertImportedExpenses(client, expenses, expenseIds);

    expect(inserts.sales).toHaveLength(1);
    expect(inserts.expenses).toHaveLength(1);
  });
});
