import React, { useState } from 'react';
import { Gift, ShoppingCart, RefreshCw, FileText, DollarSign } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api.config';

interface CreditsPurchaseProps {
  onPurchase?: (amount: number) => void;
  className?: string;
}

export const CreditsPurchase: React.FC<CreditsPurchaseProps> = ({
  onPurchase,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creditAmount, setCreditAmount] = useState(1000);


const handleBuyCredits = async () => {
  try {
    setIsLoading(true);

    // 1. Подготовка данных для платежа - это должен быть ОБЪЕКТ
    const paymentData = {
      order_id: 10,
      amount: creditAmount,
      user_id: JSON.parse(localStorage.getItem("user")).id,
      description: "Покупка лимитов",
      return_url: window.location.href
    };

    console.log(paymentData);

    // 2. Отправка запроса на бекенд
    const response = await fetch(API_ENDPOINTS.payment.create_payment, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData) // Здесь paymentData - это объект
    });

    // 3. Проверка ответа
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка от сервера:', errorData);
      throw new Error('Ошибка создания платежа');
    }

    const data = await response.json();

    // 4. Редирект на страницу оплаты
    window.location.href = data.payment_url;

  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось создать платеж. Попробуйте позже.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Покупка лимитов</h3>
        <Gift className="w-6 h-6 text-red-500" />
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Количество лимитов
        </label>
        <input
          type="number"
          value={creditAmount}
          onChange={(e) => setCreditAmount(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
          min="100"
          step="100"
        />
      </div>

      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 mb-1">
          Вы оплачиваете покупку <span className="font-bold">{creditAmount.toLocaleString()} лимитов</span> за{' '}
          <span className="font-bold text-red-600">{creditAmount.toLocaleString()} рублей</span>.
        </p>
        <p className="text-xs text-gray-600">
          Для продолжения операции нажмите кнопку "Купить".
        </p>
      </div>

      <button
        onClick={handleBuyCredits}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Обработка...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Купить
          </span>
        )}
      </button>

      {showSuccess && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          ✅ Лимиты успешно добавлены!
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button className="w-full text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center">
          <FileText className="w-4 h-4 mr-2" />
          История покупок
        </button>
        <button className="w-full text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center justify-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Способы оплаты
        </button>
      </div>
    </div>
  );
};