import axios from "axios";
import { API_BASE_URL } from "../config/constants";

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authHeaders = (token) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return { headers };
};
