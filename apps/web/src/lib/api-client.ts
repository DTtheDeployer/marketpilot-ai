// =============================================================================
// MarketPilot AI — Frontend API Client
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("marketpilot_token");
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) =>
        url.searchParams.set(k, v)
      );
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    });

    if (res.status === 401) {
      // Token expired or invalid — clear and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("marketpilot_token");
        localStorage.removeItem("marketpilot_user");
        window.location.href = "/login";
      }
      throw new ApiError("Session expired", 401, "UNAUTHORIZED");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(
        data?.error?.message || `Request failed: ${res.status}`,
        res.status,
        data?.error?.code || "UNKNOWN",
        data?.error?.details
      );
    }

    return data as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, { ...options, body });
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, { ...options, body });
  }
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, { ...options, body });
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }

  // ── Auth ─────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const res = await this.post<{
      success: boolean;
      data: { token: string; user: AuthUser };
    }>("/api/auth/login", { email, password });

    if (res.success && res.data.token) {
      localStorage.setItem("marketpilot_token", res.data.token);
      localStorage.setItem("marketpilot_user", JSON.stringify(res.data.user));
    }
    return res;
  }

  async signup(email: string, password: string, name?: string) {
    const res = await this.post<{
      success: boolean;
      data: { token: string; user: AuthUser };
    }>("/api/auth/signup", { email, password, name });

    if (res.success && res.data.token) {
      localStorage.setItem("marketpilot_token", res.data.token);
      localStorage.setItem("marketpilot_user", JSON.stringify(res.data.user));
    }
    return res;
  }

  async getMe() {
    return this.get<{ success: boolean; data: AuthUser }>("/api/auth/me");
  }

  logout() {
    localStorage.removeItem("marketpilot_token");
    localStorage.removeItem("marketpilot_user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // ── Strategies ───────────────────────────────────────────────────────────

  getStrategies() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/strategies");
  }

  getStrategy(slug: string) {
    return this.get<{ success: boolean; data: unknown }>(`/api/strategies/${slug}`);
  }

  saveStrategyConfig(slug: string, parameters: unknown, riskLimits: unknown) {
    return this.post(`/api/strategies/${slug}/config`, { parameters, riskLimits });
  }

  // ── Bots ─────────────────────────────────────────────────────────────────

  getBots() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/bots");
  }

  createBot(data: {
    name: string;
    strategySlug: string;
    mode?: string;
    config: Record<string, unknown>;
    riskLimits: Record<string, number>;
    riskPreset?: string;
    capitalAllocated: number;
  }) {
    return this.post<{ success: boolean; data: unknown }>("/api/bots", data);
  }

  startBot(id: string) {
    return this.post(`/api/bots/${id}/start`);
  }
  pauseBot(id: string) {
    return this.post(`/api/bots/${id}/pause`);
  }
  stopBot(id: string) {
    return this.post(`/api/bots/${id}/stop`);
  }
  deleteBot(id: string) {
    return this.delete(`/api/bots/${id}`);
  }
  getBotEvents(id: string) {
    return this.get<{ success: boolean; data: unknown[] }>(`/api/bots/${id}/events`);
  }

  // ── Backtests ────────────────────────────────────────────────────────────

  getBacktests() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/backtests");
  }

  createBacktest(data: {
    strategySlug: string;
    config: Record<string, unknown>;
    startDate: string;
    endDate: string;
  }) {
    return this.post<{ success: boolean; data: unknown }>("/api/backtests", data);
  }

  getBacktest(id: string) {
    return this.get<{ success: boolean; data: unknown }>(`/api/backtests/${id}`);
  }

  // ── Orders & Positions ───────────────────────────────────────────────────

  getOrders(params?: Record<string, string>) {
    return this.get<{ success: boolean; data: unknown[]; meta: unknown }>("/api/orders", { params });
  }

  getPositions() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/orders/positions/open");
  }

  // ── Markets ──────────────────────────────────────────────────────────────

  getMarkets(params?: Record<string, string>) {
    return this.get<{ success: boolean; data: unknown[]; meta: unknown }>("/api/markets", { params });
  }

  getMarket(id: string) {
    return this.get<{ success: boolean; data: unknown }>(`/api/markets/${id}`);
  }

  getMarketOrderbook(id: string) {
    return this.get<{ success: boolean; data: unknown }>(`/api/markets/${id}/orderbook`);
  }

  getMarketPrice(id: string) {
    return this.get<{ success: boolean; data: unknown }>(`/api/markets/${id}/price`);
  }

  // ── Alerts ───────────────────────────────────────────────────────────────

  getAlerts(unreadOnly = false) {
    return this.get<{ success: boolean; data: { alerts: unknown[]; unreadCount: number } }>(
      "/api/alerts",
      { params: unreadOnly ? { unreadOnly: "true" } : undefined }
    );
  }

  markAlertRead(id: string) {
    return this.patch(`/api/alerts/${id}/read`);
  }

  markAllAlertsRead() {
    return this.post("/api/alerts/read-all");
  }

  // ── Billing ──────────────────────────────────────────────────────────────

  getSubscription() {
    return this.get<{ success: boolean; data: unknown }>("/api/billing/subscription");
  }

  getPlans() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/billing/plans");
  }

  createCheckout(planTier: string, interval: string = "monthly") {
    return this.post<{ success: boolean; data: { checkoutUrl: string } }>(
      "/api/billing/checkout",
      { planTier, interval }
    );
  }

  createBillingPortal() {
    return this.post<{ success: boolean; data: { portalUrl: string } }>("/api/billing/portal");
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  getAdminStats() {
    return this.get<{ success: boolean; data: unknown }>("/api/admin/stats");
  }

  getAdminUsers(params?: Record<string, string>) {
    return this.get<{ success: boolean; data: unknown[]; meta: unknown }>("/api/admin/users", { params });
  }

  getFeatureFlags() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/admin/feature-flags");
  }

  toggleFeatureFlag(key: string, enabled: boolean) {
    return this.patch(`/api/admin/feature-flags/${key}`, { enabled });
  }

  getSystemEvents() {
    return this.get<{ success: boolean; data: unknown[] }>("/api/admin/events");
  }

  emergencyStop() {
    return this.post<{ success: boolean; data: { stoppedCount: number } }>("/api/admin/emergency-stop");
  }

  // ── Profile ──────────────────────────────────────────────────────────────

  updateProfile(data: { name?: string; timezone?: string; riskPreset?: string }) {
    return this.patch("/api/auth/profile", data);
  }

  // ── Market Sync ──────────────────────────────────────────────────────────

  triggerMarketSync() {
    return this.post<{ success: boolean; data: { synced: number; errors: number } }>("/api/markets/sync");
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  profile?: {
    tradingMode: string;
    jurisdictionStatus: string;
    onboardingComplete: boolean;
    onboardingStep: number;
    riskPreset: string;
    country?: string;
    timezone: string;
  };
  subscription?: {
    planTier: string;
    status: string;
  };
}

export const api = new ApiClient(API_BASE);
