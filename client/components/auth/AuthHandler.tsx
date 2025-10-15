import React, { useEffect } from "react";
import { API_CONFIG, buildUrl } from "@/config/api.config.ts";

interface AuthHandlerProps {
  onAuthComplete?: () => void;
}

export const AuthHandler: React.FC<AuthHandlerProps> = ({ onAuthComplete }) => {
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const currentPath = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);

      // Обработка Yandex авторизации
      if (currentPath === "/auth/yandex/success") {
        const token = urlParams.get("token");

        if (token) {
          try {
            // Получаем JWT токен из localStorage (должен быть сохранен ранее)
            const userToken = localStorage.getItem("access_token") || "";
            
            // Отправляем токен на бэкенд
            const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.YANDEX_SET_TOKEN), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                yandex_token: token
              })
            });

            if (response.ok) {
              // Устанавливаем флаг для автоматического продолжения парсинга
              localStorage.setItem("autoResumeParsing", "true");
              
              // Возвращаемся на главную страницу
              window.location.href = "/app";
              
              if (onAuthComplete) {
                onAuthComplete();
              }
            } else {
              console.error("Failed to set Yandex token");
            }
          } catch (error) {
            console.error("Error setting Yandex token:", error);
          }
        }
      }

      // Обработка Google авторизации  
      if (currentPath === "/auth/google/success") {
        const token = urlParams.get("token");
        const refreshToken = urlParams.get("refresh_token");

        if (token) {
          try {
            // Получаем JWT токен из localStorage
            const userToken = localStorage.getItem("access_token") || "";

            // Отправляем токен на бэкенд
            const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.GOOGLE_SET_TOKEN), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                google_token: token,
                refresh_token: refreshToken || "",
              })
            });

            if (response.ok) {
              // Устанавливаем флаг для автоматического продолжения парсинга
              localStorage.setItem("autoResumeParsing", "true");
              
              // Возвращаемся на главную страницу
              window.location.href = "/";
              
              if (onAuthComplete) {
                onAuthComplete();
              }
            } else {
              console.error("Failed to set Google token");
            }
          } catch (error) {
            console.error("Error setting Google token:", error);
          }
        }
      }
    };

    handleAuthRedirect();
  }, [onAuthComplete]);

  const currentPath = window.location.pathname;
  
  if (currentPath === "/auth/yandex/success" || currentPath === "/auth/google/success") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Обработка авторизации...</p>
        </div>
      </div>
    );
  }

  return null;
};
