// components/UserProfile.js
import React, { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Award,
  Zap,
  Star,
  Gift,
  Shield,
  RefreshCw,
  LogOut,
  Settings,
  HelpCircle,
  FileText,
  DollarSign,
  Activity
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../utils/utils';

const UserProfile = ({ user, onLogout, onUpdateProfile }) => {
  const [selectedTariff, setSelectedTariff] = useState('novice');
  const [credits, setCredits] = useState(user?.invoice || 1000);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Загрузка истории транзакций
  useEffect(() => {
    // Демо данные для истории
    setTransactions([
      { id: 1, amount: 100, date: new Date(), type: 'purchase' },
      { id: 2, amount: 100, date: new Date(Date.now() - 86400000), type: 'purchase' },
      { id: 3, amount: 100, date: new Date(Date.now() - 172800000), type: 'purchase' },
      { id: 4, amount: 100, date: new Date(Date.now() - 259200000), type: 'purchase' },
      { id: 5, amount: 100, date: new Date(Date.now() - 345600000), type: 'purchase' },
    ]);
  }, []);

  const handleBuyCredits = async () => {
    setIsLoading(true);
    // Имитация покупки
    setTimeout(() => {
      setCredits(prev => prev + 1000);
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const tariffs = [
    {
      id: 'novice',
      name: 'Новичок',
      icon: <Star className="w-5 h-5" />,
      activeUntil: '12.04.2025',
      credits: '100 из 1000',
      price: '1000 ₽/мес',
      features: [
        'Базовый анализ',
        'До 10 проверок в день',
        'Email поддержка'
      ],
      color: 'from-red-500 to-red-600'  // Изменено на красный
    },
    {
      id: 'additional',
      name: 'Дополнительно',
      icon: <Zap className="w-5 h-5" />,
      activeUntil: '12.04.2025',
      credits: '1000 из 1000',
      price: '2000 ₽/мес',
      features: [
        'Расширенный анализ',
        'До 50 проверок в день',
        'Приоритетная поддержка',
        'API доступ'
      ],
      color: 'from-red-500 to-red-600',  // Изменено на красный
      popular: true
    }
  ];

  const stats = [
    { label: 'Всего анализов', value: '1,234', icon: <Activity className="w-5 h-5" />, color: 'text-blue-600' },
    { label: 'В этом месяце', value: '156', icon: <Calendar className="w-5 h-5" />, color: 'text-green-600' },
    { label: 'Осталось кредитов', value: credits.toLocaleString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-purple-600' },
    { label: 'Рейтинг', value: '4.8', icon: <Award className="w-5 h-5" />, color: 'text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок с анимацией */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Личный кабинет</h1>
          <p className="text-gray-600">В данном разделе вы можете управлять своими кредитами, подписками и покупать новые услуги.</p>
        </div>

        {/* Карточка пользователя */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 transform transition-all hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                {user?.is_admin && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.username || 'Пользователь'}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    Зарегистрирован: {user?.created_at ? formatDate(user.created_at) : 'Недавно'}
                  </span>
                  {user?.is_admin && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Администратор
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onLogout}
                className="p-3 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 transform transition-all hover:scale-105 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 bg-gray-50 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Покупка кредитов */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Покупка кредитов</h3>
                <Gift className="w-6 h-6 text-red-500" />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Количество кредитов</label>
                <input
                  type="number"
                  value={1000}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                  readOnly
                />
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-1">
                  Вы оплачиваете покупку <span className="font-bold">1 000 кредитов</span> за <span className="font-bold text-red-600">1 000 рублей</span>.
                </p>
                <p className="text-xs text-gray-600">
                  Для продолжения операции нажмите кнопку "Купить".
                </p>
              </div>

              <button
                onClick={handleBuyCredits}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
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
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fadeIn">
                  ✅ Кредиты успешно добавлены!
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
          </div>

          {/* Правая колонка - Тарифы и журнал */}
          <div className="lg:col-span-2 space-y-8">
            {/* Текущий тариф */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Текущий тариф</h3>
                <button className="text-red-600 hover:text-red-700 font-medium transition-colors">
                  Сменить тариф
                </button>
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
                    onClick={() => setSelectedTariff(tariff.id)}
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
                          {React.cloneElement(tariff.icon, {
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

                    <div className={`text-sm mb-4 ${
                      selectedTariff === tariff.id ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      Количество кредитов: <span className="font-bold">{tariff.credits}</span>
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

                    {selectedTariff === tariff.id && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <button className="w-full bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                          Управление тарифом
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Журнал операций */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Журнал операций</h3>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                  Посмотреть весь журнал
                </button>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">+ {transaction.amount} кредитов</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(transaction.date)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Нет операций</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;