import { useState, useEffect, createContext, useContext } from "react";
import authService from "../services/auth.service";
import { API_ENDPOINTS } from "../config/api.config.js";

// Создаем контекст для авторизации
const AuthContext = createContext(null);

// Provider компонент
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);

  // Получение доступных сервисов
  const getAvailableServices = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.availableServices, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const services = await response.json();
        setAvailableServices(services);
        return services;
      }
    } catch (err) {
      console.error("Failed to fetch available services:", err);
      // По умолчанию возвращаем пустой массив, если не удалось получить сервисы
      setAvailableServices([]);
    }
    return [];
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Пробуем получить актуальные данные пользователя
          const userData = await authService.getCurrentUser();
          setUser(userData);
          // Получаем доступные сервисы
          await getAvailableServices();
        } else {
          // Проверяем сохраненного пользователя
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            // Получаем доступные сервисы для сохраненного пользователя
            await getAvailableServices();
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Функция входа
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      // Получаем доступные сервисы после успешного входа
      await getAvailableServices();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция регистрации
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(username, email, password);
      // После регистрации можно автоматически войти
      await login(username, password);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Обновление данных пользователя
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    availableServices,
    getAvailableServices,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook для использования контекста авторизации
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default useAuth;
