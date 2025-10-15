import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = "Панель управления" 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.is_admin === true;

  React.useEffect(() => {
    if (user && !isAdmin) {
      navigate('/documentation');
    }
  }, [user, isAdmin, navigate]);

  if (!user) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="text-center py-12">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Доступ запрещен</h2>
            <p className="text-red-600">У вас нет прав для доступа к этой странице</p>
            <button 
              onClick={() => navigate('/app')}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Вернуться к документации
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="flex items-center gap-2 mt-1 p-6 pb-0">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Администратор
              </span>
              <span className="text-sm text-gray-600">
                {user.username} • {user.email}
              </span>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};