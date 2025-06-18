import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from './config';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
  withCredentials: true, // Включаем поддержку cookies
});

// Тип для ответа с ошибкой
interface ErrorResponse {
  message: string;
  statusCode: number;
  errors?: any;
}

// Интерцептор для добавления токена
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      // Обработка различных HTTP статусов
      switch (error.response.status) {
        case 400:
          // Неверный запрос
          if (error.response.data.errors) {
            return Promise.reject(new Error(JSON.stringify(error.response.data.errors)));
          }
          return Promise.reject(new Error(error.response.data.message || 'Неверный запрос'));
        case 401:
          // Неавторизован
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(new Error('Сессия истекла. Пожалуйста, войдите снова.'));
        case 403:
          // Доступ запрещен
          return Promise.reject(new Error('Доступ запрещен'));
        case 404:
          // Ресурс не найден
          return Promise.reject(new Error('Ресурс не найден'));
        case 500:
          // Внутренняя ошибка сервера
          console.error('Server error:', error.response.data);
          return Promise.reject(new Error('Внутренняя ошибка сервера'));
        default:
          console.error('API error:', error.response.data);
          return Promise.reject(new Error(error.response.data.message || 'Произошла ошибка'));
      }
    } else if (error.request) {
      // Ошибка сети
      console.error('Network error:', error.request);
      return Promise.reject(new Error('Ошибка сети. Проверьте подключение к интернету.'));
    } else {
      // Ошибка в настройках запроса
      console.error('Request error:', error.message);
      return Promise.reject(new Error('Ошибка при отправке запроса'));
    }
  }
);

export default apiClient; 