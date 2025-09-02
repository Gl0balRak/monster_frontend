import React from 'react';
import { User, Shield, Settings, HelpCircle, LogOut } from 'lucide-react';

interface UserProfileCardProps {
  user?: {
    username?: string;
    email?: string;
    created_at?: string | Date;
    is_admin?: boolean;
  };
  onLogout?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  formatDate?: (date: string | Date) => string;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onLogout,
  onSettings,
  onHelp,
  formatDate = (date) => new Date(date).toLocaleDateString('ru-RU'),
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:shadow-xl ${className}`}>
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
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.username || 'Пользователь'}
            </h2>
            <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
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
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Настройки"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {onHelp && (
            <button
              onClick={onHelp}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Помощь"
            >
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-3 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};