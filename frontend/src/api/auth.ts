import { api } from "./client";

export const authApi = {
  register: (email: string, password: string) =>
    api.post("/auth/register", { email, password }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/auth/password", { currentPassword, newPassword }),

  deleteAccount: () => api.delete("/auth/account"),
};
