import { http } from "../api/http";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const AUTH_EVENT = "auth-session-changed";

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY) || "";

export const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const setAuthSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("admin_token");
  http.post("/auth/logout").catch(() => {});
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const onAuthSessionChangeEvent = AUTH_EVENT;
