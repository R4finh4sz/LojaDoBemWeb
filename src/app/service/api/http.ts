import axios from "axios";
import { getAccessToken } from "./auth-session";
import { demoEnabled } from "./demo-config";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/",
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  if (demoEnabled) config.adapter = (await import("./demo-adapter")).demoAdapter;
  const token = getAccessToken();
  if (token) config.headers.set("Authorization", "Bearer " + token);
  return config;
});

export function apiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data;
  const fields = data?.errors?.fieldErrors ?? data?.errors ?? data?.details?.fieldErrors;
  const issue = fields && Object.values(fields).flat().find((value) => typeof value === "string");
  if (typeof issue === "string") return issue;
  return typeof data?.message === "string" ? data.message : fallback;
}
