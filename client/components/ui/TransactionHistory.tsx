import React from 'react';
import { DollarSign, ChevronRight, Clock } from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  date: Date;
  type: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  onViewAll?: () => void;
  className?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions = [],
  onViewAll,
  className = ''
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дней назад`;
    return formatDate(date);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Журнал операций</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Посмотреть весь журнал
          </button>
        )}
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">+ {transaction.amount} кредитов</p>
                <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
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
  );
};