import { http } from "./http";

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type LoginResponse = {
  data: {
    requiresTwoFactor?: boolean;
    challengeId?: string;
    user?: { role?: { id?: number } };
  };
  message?: string;
};

type VerifyResponse = {
  data: {
    accessToken?: string;
    refreshToken?: string;
    user?: { role?: { id?: number } };
  };
  message?: string;
};

export const authService = {
  login: async (form: LoginForm) => {
    const payload = {
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe,
    };
    const { data } = await http.post<LoginResponse>(`auth/local`, payload);
    return data;
  },

  verifyCode: async (payload: {
    email: string;
    code: string;
    challengeId: string;
  }) => {
    const { data } = await http.post<VerifyResponse>(
      `auth/local/verify-code`,
      payload,
    );
    return data;
  },

  resendCode: async (payload: { email: string; challengeId: string }) => {
    const { data } = await http.post<LoginResponse>(
      `auth/local/resend-code`,
      payload,
    );
    return data;
  },
};

export default authService;
