import axios from "axios";
import { API_BASE_URL } from "../config/constants";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

export const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});
