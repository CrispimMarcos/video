import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erro ao ler usuário do localStorage:", err);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);


  const login = async (email, password) => {
    try {
      const res = await api.post("/login/", { email, password });
      const { access, refresh, user } = res.data;

      // Salva tokens e usuário
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      // 🔥 Atualiza Axios imediatamente
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      setUser(user);
      console.log("Login bem-sucedido:", user);

      return user;
    } catch (err) {
      console.error(err.response?.data || err);
      throw new Error("Credenciais inválidas.");
    }
  };


  const register = async ({ nome, email, telefone, password, is_superuser }) => {
    try {
      await api.post("/register/", { nome, email, telefone, password, is_superuser });
      return await login(email, password);
    } catch (err) {
      console.error(err.response?.data || err);
      throw new Error("Erro ao registrar. Verifique os dados e tente novamente.");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) throw new Error("No refresh token available");

    try {
      const res = await api.post("/token/refresh/", { refresh });
      localStorage.setItem("access_token", res.data.access);
      return res.data.access;
    } catch (err) {
      logout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }, [logout]);

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newAccess = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
