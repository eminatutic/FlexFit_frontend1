import { apiFetch } from "./api";

export const loginUser = async (payload) => {
  return await apiFetch("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};