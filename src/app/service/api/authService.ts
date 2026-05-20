import { http } from "./http";

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type AuthUser = {
  id?: number;
  email?: string;
  nome?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  photoUrl?: string;
  role?: { id?: number };
};

type LoginResponse = {
  data: {
    jwt?: string;
    requiresTwoFactor?: boolean;
    challengeId?: string;
    user?: AuthUser;
  };
  message?: string;
};

type VerifyResponse = {
  data: {
    jwt?: string;
    refreshToken?: string;
    user?: AuthUser;
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
    const { data } = await http.post<LoginResponse>(
      `master/auth/local`,
      payload,
    );
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
