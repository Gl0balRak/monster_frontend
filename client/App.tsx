import React, { useState } from "react";
import "./global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./i18n/config";

// Yandex & Google auth
import { AuthHandler } from "@/components/auth";

// Auth imports
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";

// Layout imports
import { Header, Sidebar } from "./components/layout";

// Page imports
import TextAnalyzer from "./pages/TextAnalyzer";

import Semantix from "./pages/Semantix";
import QueryIndex from "./pages/QueryIndex";
import Admin from "./pages/Admin.tsx";

// import QueryIndex from './pages/QueryIndex'; // Временно отключено
import PlaceholderPage from "./pages/PlaceholderPage";
import PersonalAccount from "./pages/PersonalAccount";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient();

// Компонент основного layout с sidebar
const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("semantics");
  const { availableServices } = useAuth();

  // Проверяем, нужно ли пока��ать AuthHandler
  const currentPath = window.location.pathname;
  if (
    currentPath === "/auth/yandex/success" ||
    currentPath === "/auth/google/success"
  ) {
    return <AuthHandler />;
  }

  // Функция проверки доступности сервиса
  const isServiceAvailable = (serviceName: string) => {
    return availableServices.includes(serviceName);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "semantics":
        return isServiceAvailable("semantics") ? (
          <Semantix />
        ) : (
          <PlaceholderPage
            title="Семантика"
            description="Сервис временно недоступен"
          />
        );
      case "text-analyzer":
        return isServiceAvailable("text-analyzer") ? (
          <TextAnalyzer />
        ) : (
          <PlaceholderPage
            title="Текстовый анализатор"
            description="Сервис временно недоступен"
          />
        );
      case "query-index":
        return isServiceAvailable("query-index") ? (
          <QueryIndex />
        ) : (
          <PlaceholderPage
            title="Прокачка запросного индекса"
            description="Сервис временно недоступен"
          />
        );
      case "documentation":
        return (
          <PlaceholderPage
            title="Документация"
            description="Справочные материалы и руководства по использованию сервиса"
          />
        );
      case "profile":
        return (
          <PersonalAccount
            title="Личный кабинет"
            description="Управление аккаунтом и настройками пользователя"
          />
        );
      case "seo-guild":
        return (
          <PlaceholderPage
            title="SEO-гильдия"
            description="Сообщество SEO-специалистов и обмен опытом"
          />
        );
      case "telegram":
        return (
          <PlaceholderPage
            title="Блог в телеграм"
            description="Последние новости и обновления в нашем Telegram-канале"
          />
        );
      default:
        return (
          <PlaceholderPage
            title="Настройки проекта"
            description="Настройки и конфигурация проекта"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-0">
      <Header onPageChange={setCurrentPage} />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        {renderPage()}
      </div>
    </div>
  );
};

// Главный компонент приложения с роутингом
const MainApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Защищенные маршруты */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Admin />} />

        <Route
          path="/app/analyzer"
          element={
            <ProtectedRoute>
              <TextAnalyzer />
            </ProtectedRoute>
          }
        />

        {/* Редирект с корня */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* 404 страница */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-600">Страница не найдена</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

// Корневой компонент с провайдерами
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MainApp />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
