import React, { useState } from 'react';
import { Star, Zap, ChevronRight } from 'lucide-react';

interface Tariff {
  id: string;
  name: string;
  icon: React.ReactNode;
  activeUntil: string;
  credits: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface TariffCardsProps {
  selectedTariff?: string;
  onTariffChange?: (tariffId: string) => void;
  onChangeTariff?: () => void;
  className?: string;
}

export const TariffCards: React.FC<TariffCardsProps> = ({
  selectedTariff: externalSelectedTariff,
  onTariffChange,
  onChangeTariff,
  className = ''
}) => {
  const [selectedTariff, setSelectedTariff] = useState(externalSelectedTariff || 'novice');

  const handleTariffSelect = (tariffId: string) => {
    setSelectedTariff(tariffId);
    if (onTariffChange) {
      onTariffChange(tariffId);
    }
  };

  const tariffs: Tariff[] = [
    {
      id: 'novice',
      name: 'Новичок',
      icon: <Star className="w-5 h-5" />,
      activeUntil: '12.04.2025',
      credits: '100 из 1000',
      price: '1000 ₽/мес',
      features: ['Базовый анализ', 'До 10 проверок в день', 'Email поддержка']
    },
    {
      id: 'additional',
      name: 'Дополнительно',
      icon: <Zap className="w-5 h-5" />,
      activeUntil: '12.04.2025',
      credits: '1000 из 1000',
      price: '2000 ₽/мес',
      features: ['Расширенный анализ', 'До 50 проверок в день', 'Приоритетная поддержка', 'API доступ'],
      popular: true
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Текущий тариф</h3>
        {onChangeTariff && (
          <button
            onClick={onChangeTariff}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Сменить тариф
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tariffs.map((tariff) => (
          <div
            key={tariff.id}
            className={`relative rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
              selectedTariff === tariff.id
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl'
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => handleTariffSelect(tariff.id)}
          >
            {tariff.popular && (
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                Популярный
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedTariff === tariff.id ? 'bg-white/20' : 'bg-red-50'
                }`}>
                  {React.cloneElement(tariff.icon as React.ReactElement, {
                    className: `w-5 h-5 ${selectedTariff === tariff.id ? 'text-white' : 'text-red-600'}`
                  })}
                </div>
                <div>
                  <h4 className={`font-bold ${
                    selectedTariff === tariff.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    Тариф "{tariff.name}"
                  </h4>
                  <p className={`text-sm ${
                    selectedTariff === tariff.id ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    Активен до {tariff.activeUntil}
                  </p>
                </div>
              </div>
            </div>

            <div className={`text-2xl font-bold mb-4 ${
              selectedTariff === tariff.id ? 'text-white' : 'text-gray-900'
            }`}>
              {tariff.price}
            </div>

            <ul className="space-y-2">
              {tariff.features.map((feature, idx) => (
                <li key={idx} className={`text-sm flex items-center ${
                  selectedTariff === tariff.id ? 'text-white/90' : 'text-gray-600'
                }`}>
                  <ChevronRight className="w-4 h-4 mr-1" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};