import { http } from "./http";
import { clearAuthSession } from "./auth-session";

type LoginResponse =
  | { twoFactorRequired: false; token: string }
  | { twoFactorRequired?: true; challengeId: string };

type VerifyCodeResponse = { token: string } | { firstLogin: true; firstLoginToken: string };

export const authService = {
  async login(payload: { email: string; password: string }) {
    const { data } = await http.post<LoginResponse>("auth/login", payload);
    return data;
  },
  async verifyCode(payload: { challengeId: string; code: string }) {
    const { data } = await http.post<VerifyCodeResponse>("auth/2fa/verify", payload);
    return data;
  },
  async logout() {
    try {
      await http.post("auth/logout");
    } catch {
      // Clear the local session even when the server is unreachable.
    } finally {
      clearAuthSession();
    }
  },
};
