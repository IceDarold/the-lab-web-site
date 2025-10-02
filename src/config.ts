/// <reference types="vite/client" />

export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'https://the-lab-web-site-backend.vercel.app', // URL сервера бэкенда
  endpoint: '/api/applications' // Эндпоинт для отправки заявок
};