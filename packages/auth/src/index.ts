// =============================================================================
// MarketPilot AI — Auth Utilities
// =============================================================================

export const AUTH_COOKIE_NAME = "marketpilot-session";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  image: string | null;
};

export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === "SUPER_ADMIN";
}

export const PROTECTED_ROUTES = ["/app"] as const;
export const ADMIN_ROUTES = ["/app/admin"] as const;
export const AUTH_ROUTES = ["/login", "/signup"] as const;
