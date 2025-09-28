import React, { useEffect, useState } from 'react';
import { Plus, Star, Zap } from 'lucide-react';

interface Tariff {
  id: string;
  name: string;
  icon?: React.ReactNode;
  activeUntil?: string;
  credits?: string;
  price?: string;
  features?: string[];
  popular?: boolean;
  isActive?: boolean;
}

interface TariffCardsProps {
  selectedTariff?: string;
  onTariffChange?: (tariffId: string) => void;
  onChangeTariff?: () => void;
  className?: string;
  items?: Tariff[];
}

export const TariffCards: React.FC<TariffCardsProps> = ({
  selectedTariff: externalSelectedTariff,
  onTariffChange,
  onChangeTariff,
  className = '',
  items,
}) => {
  const [selectedTariff, setSelectedTariff] = useState<string | undefined>(
    externalSelectedTariff || items?.find((t) => t.isActive)?.id
  );

  useEffect(() => {
    setSelectedTariff(externalSelectedTariff || items?.find((t) => t.isActive)?.id);
  }, [externalSelectedTariff, items]);

  const handleTariffSelect = (tariffId: string) => {
    setSelectedTariff(tariffId);
    if (onTariffChange) {
      onTariffChange(tariffId);
    }
  };

  const defaultTariffs: Tariff[] = [
    {
      id: 'novice',
      name: 'Новичок',
      icon: <Star className="w-5 h-5" />,
      activeUntil: '—',
      credits: '—',
      price: '—',
      features: ['Базовый анализ', 'До 10 проверок в день', 'Email поддержка']
    },
    {
      id: 'additional',
      name: 'Дополнительно',
      icon: <Zap className="w-5 h-5" />,
      activeUntil: '—',
      credits: '—',
      price: '—',
      features: ['Расширенный анализ', 'До 50 проверок в день', 'Приоритетная поддержка', 'API доступ'],
      popular: true
    }
  ];

  const tariffsToRender = (items && items.length > 0 ? items : defaultTariffs).map((t, idx) => ({
    ...t,
    icon:
      t.icon || (idx % 2 === 0 ? <Star className="w-5 h-5" /> : <Zap className="w-5 h-5" />),
  }));

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
        {tariffsToRender.map((tariff) => {
          const isSelected = selectedTariff === tariff.id;
          const isActive = tariff.isActive;
          return (
            <div
              key={tariff.id}
              className={`relative rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                isSelected || isActive
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
                    isSelected || isActive ? 'bg-white/20' : 'bg-red-50'
                  }`}>
                    {React.cloneElement(tariff.icon as React.ReactElement, {
                      className: `w-5 h-5 ${isSelected || isActive ? 'text-white' : 'text-red-600'}`
                    })}
                  </div>
                  <div>
                    <h4 className={`font-bold ${
                      isSelected || isActive ? 'text-white' : 'text-gray-900'
                    }`}>
                      Тариф "{tariff.name}"
                    </h4>
                    {tariff.activeUntil && (
                      <p className={`text-sm ${
                        isSelected || isActive ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        Активен до {tariff.activeUntil}
                      </p>
                    )}
                    {isActive && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-white/20">
                        Активный
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {tariff.price && (
                <div className={`text-2xl font-bold mb-4 ${
                  isSelected || isActive ? 'text-white' : 'text-gray-900'
                }`}>
                  {tariff.price}
                </div>
              )}

              {tariff.features && tariff.features.length > 0 && (
                <ul className="space-y-2">
                  {tariff.features.map((feature, idx) => (
                    <li key={idx} className={`text-sm flex items-center ${
                      isSelected || isActive ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      <Plus className="w-4 h-4 mr-1" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
