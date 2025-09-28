import React, { useState, useEffect } from "react";
import { UserProfileCard } from "@/components/cards/UserProfileCard";
import { StatsCards } from "@/components/cards/StatsCards";
import { CreditsPurchase } from "@/components/cards/CreditsPurchase";
import { TariffCards } from "@/components/cards/TariffCards";
import { DocumentIcon } from "@/components/layout/Sidebar"
import { TransactionHistory } from "@/components/ui//TransactionHistory";
import { useAuth } from "@/hooks/useAuth.jsx";
import { API_ENDPOINTS } from "@/config/api.config.js";

interface PersonalAccountContentProps {
  onLogout?: () => void;
}

export const PersonalAccountContent: React.FC<PersonalAccountContentProps> = ({
                                                                                onLogout,
                                                                              }) => {
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [credits, setCredits] = useState("-");
  const [selectedTariff, setSelectedTariff] = useState("novice");
  const [transactions, setTransactions] = useState([]);

  // Получаем информацию о пользователе с API
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        const response = await fetch(API_ENDPOINTS.auth.me, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }

      try {
        const response = await fetch(API_ENDPOINTS.limits.balance, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCredits(data["balance"]);
        }
      } catch (error) {
        console.error("Failed to fetch user balance:", error);
      }

      try {
        const response = await fetch(API_ENDPOINTS.limits.transactionHistory, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);

          let new_transactions = data["operations_log"].map(operation => ({
              id: operation.id,
              amount: operation.amount,
              type: operation.entry_type,
              date: new Date(operation.created_at)
          }));

          console.log(new_transactions);
          console.log(data["operations_log"]);
          setTransactions(new_transactions);
        }
      } catch (error) {
        console.error("Failed to fetch user transaction history:", error);
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSettings = () => {
    console.log("Открыть настройки");
  };

  const handleHelp = () => {
    console.log("Открыть помощь");
  };

  const handlePurchase = (amount: number) => {
    setCredits((prev) => prev + amount);
    console.log(`Покупка ${amount} лимитов`);
  };

  const handleTariffChange = (tariffId: string) => {
    setSelectedTariff(tariffId);
    console.log(`Выбран тариф: ${tariffId}`);
  };

  const handleChangeTariff = () => {
    console.log("Смена тарифа");
  };

  const handleViewAllTransactions = () => {
    console.log("Просмотр всех транзакций");
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="w-full">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Личный кабинет
          </h1>
          <p className="text-gray-600">
            В данном разделе вы можете управлять своими лимитами, подписками и
            покупать новые услуги.
          </p>
        </div>

        {/* Карточка пользователя */}
        <UserProfileCard
          user={userInfo || user}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onHelp={handleHelp}
          formatDate={formatDate}
          className="mb-8"
        />

        {/* Статистика */}
        <StatsCards credits={credits} className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Покупка кредитов */}
          <div className="lg:col-span-1">
            <CreditsPurchase onPurchase={handlePurchase} />
          </div>

          {/* Тарифы и журнал */}
          <div className="lg:col-span-2 space-y-8">
            <TariffCards
              selectedTariff={selectedTariff}
              onTariffChange={handleTariffChange}
              onChangeTariff={handleChangeTariff}
            />

            <TransactionHistory
              transactions={transactions}
              onViewAll={handleViewAllTransactions}
            />
          </div>
        </div>

        {/* Подвал с документами */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-sm text-gray-500">
              Нажимая на кнопки покупки услуг, вы соглашаетесь с условиями оферты
            </div>

            <a
              href="/оферта.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <DocumentIcon />
              Скачать оферту (PDF)
            </a>

            <div className="text-xs text-gray-400">
              © 2025 Все права защищены
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};