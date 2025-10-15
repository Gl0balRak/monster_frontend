import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BarChart3, Users, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Управление документацией',
      description: 'Редактирование разделов и статей',
      icon: <FileText className="w-6 h-6" />,
      action: () => navigate('/admin/documentation'),
      color: 'bg-blue-500'
    },
    {
      title: 'Статистика сайта',
      description: 'Просмотр аналитики и метрик',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => alert('Раздел в разработке'),
      color: 'bg-green-500'
    },
    {
      title: 'Управление пользователями',
      description: 'Просмотр и редактирование пользователей',
      icon: <Users className="w-6 h-6" />,
      action: () => alert('Раздел в разработке'),
      color: 'bg-purple-500'
    },
    {
      title: 'Настройки системы',
      description: 'Общие настройки платформы',
      icon: <Settings className="w-6 h-6" />,
      action: () => alert('Раздел в разработке'),
      color: 'bg-orange-500'
    },
  ];

  return (
    <AdminLayout title="Панель управления">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Общая статистика</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-blue-800">Разделов</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-green-800">Статей</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1,234</div>
              <div className="text-sm text-purple-800">Пользователей</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">89</div>
              <div className="text-sm text-orange-800">Активных сессий</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;