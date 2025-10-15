import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/forms/LoginForm';
import LegalInfoModal from '../components/auth/LegalInfoModal';
import ServiceDescription from '../components/auth/ServiceDescription';
import { useAuth } from '../hooks/useAuth';
import { FileText } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 relative">
      <button
        onClick={() => setIsLegalModalOpen(true)}
        className="fixed bottom-6 right-6 flex items-center space-x-3 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg hover:bg-red-700 transition-colors z-10"
      >
        <FileText className="w-5 h-5" />
        <span className="font-medium">Юридическая информация</span>
      </button>

      <div className="w-full max-w-[800px] mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Войдите в свой аккаунт
            </h1>
            <p className="text-gray-600">
              Или{' '}
              <Link
                to="/register"
                className="font-medium text-red-600 hover:text-red-500"
              >
                зарегистрируйтесь
              </Link>
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="mt-6">
          <ServiceDescription />
        </div>
      </div>

      <LegalInfoModal 
        isOpen={isLegalModalOpen} 
        onClose={() => setIsLegalModalOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;