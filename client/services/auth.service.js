// src/services/auth.service.js

import { API_ENDPOINTS } from '../config/api.config';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  // Получить заголовки для запросов
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Сохранить токены
  saveTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Удалить токены
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Регистрация
  async register(username, email, password) {
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Вход
  async login(username, password) {
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();

      // Сохраняем токены и информацию о пользователе
      this.saveTokens(data.access_token, data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Выход
  async logout() {
    try {
      const response = await fetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        console.error('Logout failed on server');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // В любом случае очищаем локальные токены
      this.clearTokens();
    }
  }

  // Обновить токены
  async refreshTokens() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.saveTokens(data.access_token, data.refresh_token);

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Получить информацию о текущем пользователе
  async getCurrentUser() {
    try {
      const response = await fetch(API_ENDPOINTS.auth.me, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Попробуем обновить токен
          await this.refreshTokens();
          // Повторяем запрос с новым токеном
          return this.getCurrentUser();
        }
        throw new Error('Failed to get user info');
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Изменить пароль
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await fetch(API_ENDPOINTS.auth.changePassword, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Password change failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!this.token;
  }

  // Получить сохраненного пользователя
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Создаем единственный экземпляр сервиса
const authService = new AuthService();

export default authService;