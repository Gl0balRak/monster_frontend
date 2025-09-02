import React, { useState, useEffect } from "react";
import { UserProfileCard } from "@/components/cards/UserProfileCard";
import { StatsCards } from "@/components/cards/StatsCards";
import { CreditsPurchase } from "@/components/cards/CreditsPurchase";
import { TariffCards } from "@/components/cards/TariffCards";
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
  const [credits, setCredits] = useState(1000);
  const [selectedTariff, setSelectedTariff] = useState("novice");
  const [transactions] = useState([
    { id: 1, amount: 100, date: new Date(), type: "purchase" },
    {
      id: 2,
      amount: 100,
      date: new Date(Date.now() - 86400000),
      type: "purchase",
    },
    {
      id: 3,
      amount: 100,
      date: new Date(Date.now() - 172800000),
      type: "purchase",
    },
  ]);

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
          // Устанавливаем кредиты из данных пользователя, если они есть
          if (data.invoice) {
            setCredits(data.invoice);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
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
    console.log(`Покупка ${amount} кредитов`);
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
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Личный кабинет
          </h1>
          <p className="text-gray-600">
            В данном разделе вы можете управлять своими кредитами, подписками и
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
      </div>
    </div>
  );
};
