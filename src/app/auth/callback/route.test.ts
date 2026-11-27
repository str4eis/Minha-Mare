import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({
      auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
    });
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("redirects to home after successful exchange when next is missing", async () => {
    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=auth-code"
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/home");
  });

  it("uses home when next is unsafe", async () => {
    const request = new NextRequest(
      "http://localhost:3000/auth/callback?code=auth-code&next=%2F%2Foutside.test"
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/home");
  });
});
