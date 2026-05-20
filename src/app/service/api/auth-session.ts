const ACCESS_TOKEN_KEY = "accessToken";
const ROLE_ID_KEY = "userRoleId";
const USER_NAME_KEY = "userName";
const USER_EMAIL_KEY = "userEmail";
const USER_AVATAR_KEY = "userAvatarUrl";

const roleHomeRoutes: Record<number, string> = {
  4: "/main/Master",
  5: "/main/Admin",
};

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

export const getStoredRoleId = (): number | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawRoleId = window.localStorage.getItem(ROLE_ID_KEY);
  const parsedRoleId = rawRoleId ? Number(rawRoleId) : NaN;

  if (Number.isFinite(parsedRoleId)) {
    return parsedRoleId;
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const payload = token ? decodeJwtPayload(token) : null;
  const fallbackRoleId =
    payload?.roleId ?? payload?.userRoleId ?? payload?.role;
  const parsedFallbackRoleId = Number(fallbackRoleId);

  return Number.isFinite(parsedFallbackRoleId) ? parsedFallbackRoleId : null;
};

export const storeAuthSession = ({
  jwt,
  roleId,
  userName,
  userEmail,
  avatarUrl,
}: {
  jwt: string;
  roleId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  avatarUrl?: string | null;
}) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, jwt);

  if (typeof roleId === "number" && Number.isFinite(roleId)) {
    window.localStorage.setItem(ROLE_ID_KEY, String(roleId));
  }

  if (typeof userName === "string" && userName.trim()) {
    window.localStorage.setItem(USER_NAME_KEY, userName.trim());
  }

  if (typeof userEmail === "string" && userEmail.trim()) {
    window.localStorage.setItem(USER_EMAIL_KEY, userEmail.trim());
  }

  if (typeof avatarUrl === "string" && avatarUrl.trim()) {
    window.localStorage.setItem(USER_AVATAR_KEY, avatarUrl.trim());
  }
};

export const getStoredUserName = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(USER_NAME_KEY);
};

export const getStoredAvatarUrl = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(USER_AVATAR_KEY);
};

export const getStoredUserEmail = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(USER_EMAIL_KEY);
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ROLE_ID_KEY);
  window.localStorage.removeItem(USER_NAME_KEY);
  window.localStorage.removeItem(USER_EMAIL_KEY);
  window.localStorage.removeItem(USER_AVATAR_KEY);
};

export const getRoleHomePath = (roleId?: number | null) => {
  if (roleId && roleHomeRoutes[roleId]) {
    return roleHomeRoutes[roleId];
  }

  return "/Auth/Login";
};

export const isAllowedRole = (
  allowedRoles: number | number[] | undefined,
  roleId: number | null,
) => {
  if (allowedRoles === undefined) {
    return true;
  }

  if (roleId === null) {
    return false;
  }

  return Array.isArray(allowedRoles)
    ? allowedRoles.includes(roleId)
    : allowedRoles === roleId;
};
