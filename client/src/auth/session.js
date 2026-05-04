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
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("admin_token");
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const onAuthSessionChangeEvent = AUTH_EVENT;
