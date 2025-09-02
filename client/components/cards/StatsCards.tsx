import React from 'react';
import { Activity, Calendar, CreditCard, Award, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  credits: number;
  totalAnalyses?: string;
  monthlyAnalyses?: string;
  rating?: string;
  className?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  credits,
  totalAnalyses = '1,234',
  monthlyAnalyses = '156',
  rating = '4.8',
  className = ''
}) => {
  const stats = [
    { label: 'Всего анализов', value: totalAnalyses, icon: <Activity className="w-5 h-5" />, color: 'text-blue-600' },
    { label: 'В этом месяце', value: monthlyAnalyses, icon: <Calendar className="w-5 h-5" />, color: 'text-green-600' },
    { label: 'Осталось кредитов', value: credits.toLocaleString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-purple-600' },
    { label: 'Рейтинг', value: rating, icon: <Award className="w-5 h-5" />, color: 'text-yellow-600' },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-6 transform transition-all hover:scale-105 hover:shadow-lg"
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
  );
};