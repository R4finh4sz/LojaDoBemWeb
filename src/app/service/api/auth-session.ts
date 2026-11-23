import { demoEnabled } from "./demo-config";

const ACCESS_TOKEN_KEY = "accessToken";
const ROLE_ID_KEY = "userRoleId";
const USER_NAME_KEY = "userName";
const USER_EMAIL_KEY = "userEmail";
const USER_AVATAR_KEY = "userAvatarUrl";

const roleHomeRoutes = {
  MASTER: "/main/Master",
  PrefeituraVendedor: "/main/Prefeitura",
  COOPERATIVA: "/main/Cooperativa",
} as const;

export type WebRole = keyof typeof roleHomeRoutes;

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return token && token.endsWith(".demo") === demoEnabled ? token : null;
}

function profileStorage() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ? localStorage : sessionStorage;
}

export function getTokenRole(token: string): WebRole | null {
  const role = decodeJwtPayload(token)?.role;
  return typeof role === "string" && Object.prototype.hasOwnProperty.call(roleHomeRoutes, role)
    ? role as WebRole
    : null;
}

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

export const decodeJwtPayload = (
  token: string,
): Record<string, unknown> | null => {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const isJwtValid = (token: string | null | undefined): boolean => {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return false;
  }

  const expiresAt = Number(payload.exp);
  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  return expiresAt * 1000 > Date.now();
};

export function getStoredRole() {
  const token = getAccessToken();
  return token ? getTokenRole(token) : null;
}

export function storeAuthSession(jwt: string, email: string, remember: boolean) {
  clearAuthSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, jwt);
  storage.setItem(USER_EMAIL_KEY, email);
}

export const getStoredUserName = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return profileStorage().getItem(USER_NAME_KEY);
};

export const getStoredAvatarUrl = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return profileStorage().getItem(USER_AVATAR_KEY);
};

export const setStoredAvatarUrl = (avatarUrl: string) => {
  if (typeof window === "undefined") {
    return;
  }

  profileStorage().setItem(USER_AVATAR_KEY, avatarUrl);
  window.dispatchEvent(new Event("profile-updated"));
};

export const getStoredUserEmail = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return profileStorage().getItem(USER_EMAIL_KEY);
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of [ACCESS_TOKEN_KEY, ROLE_ID_KEY, USER_NAME_KEY, USER_EMAIL_KEY, USER_AVATAR_KEY]) {
      storage.removeItem(key);
    }
  }
};

export function getRoleHomePath(role?: WebRole | null) {
  return role ? roleHomeRoutes[role] : "/Auth/Login";
}

export function isAllowedRole(allowedRoles: WebRole | WebRole[] | undefined, role: WebRole | null) {
  return !allowedRoles || (role !== null && (Array.isArray(allowedRoles) ? allowedRoles.includes(role) : allowedRoles === role));
}
