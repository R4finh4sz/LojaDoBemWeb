import axios from "axios";

const http = axios.create({
  baseURL: "https://coral-app-xzr8d.ondigitalocean.app/api/",
});

const maskSensitiveFields = (value: unknown): unknown => {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveFields(item));
  }

  const record = value as Record<string, unknown>;
  const masked: Record<string, unknown> = {};

  Object.entries(record).forEach(([key, item]) => {
    const normalizedKey = key.toLowerCase();
    const isSensitive =
      normalizedKey.includes("password") || normalizedKey.includes("token");

    masked[key] = isSensitive ? "********" : maskSensitiveFields(item);
  });

  return masked;
};

const getAccessToken = async (): Promise<string | null> => {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
  } catch (e) {
    // ignore
  }
  return null;
};

http.interceptors.request.use(
  async (config) => {
    if ((config.data as any)?._parts) {
      config.headers = config.headers ?? {};
      config.headers["Content-Type"] = "multipart/form-data";
    }

    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${accessToken}`;
    }

    const method = (config.method || "get").toUpperCase();
    const route = `${config.baseURL || ""}${config.url || ""}`;

    console.warn(`[HTTP] ${method} ${route}`);

    if (config.data) {
      console.warn("[HTTP] Payload:", maskSensitiveFields(config.data));
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export { http };
