// client/pages/LoginPage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/forms/LoginForm';
import { useAuth } from '../hooks/useAuth.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Если уже авторизован - редирект
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Войдите в свой аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Или{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              зарегистрируйтесь
            </Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;