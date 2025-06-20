'use client';

import { useState } from 'react';
import Header from '@/components/Header';

export default function TestAPIPage() {
  const [openaiResult, setOpenaiResult] = useState<any>(null);
  const [emailResult, setEmailResult] = useState<any>(null);
  const [telegramResult, setTelegramResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState('test@example.com');

  const testOpenAI = async () => {
    setLoading('openai');
    try {
      const response = await fetch('/api/test/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Apple представила новый iPhone 15 с революционными функциями. Компания объявила о выпуске флагманского смартфона, который включает в себя улучшенную камеру, более быстрый процессор и инновационный дизайн.'
        })
      });
      const data = await response.json();
      setOpenaiResult(data);
    } catch (error) {
      setOpenaiResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(null);
    }
  };

  const testEmail = async () => {
    setLoading('email');
    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddress,
          subject: 'Тест новостного агрегатора',
          content: 'Это тестовое письмо для проверки настроек email уведомлений.'
        })
      });
      const data = await response.json();
      setEmailResult(data);
    } catch (error) {
      setEmailResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(null);
    }
  };

  const testTelegram = async () => {
    setLoading('telegram');
    try {
      const response = await fetch('/api/test/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: '594250971', // Ваш chatId
          message: 'Тестовое сообщение от новостного агрегатора! 🎉\n\nЭто проверка настроек Telegram уведомлений.'
        })
      });
      const data = await response.json();
      setTelegramResult(data);
    } catch (error) {
      setTelegramResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Тестирование API ключей
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Проверьте работу ваших API ключей для расширенной функциональности
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* OpenAI API */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">🤖 OpenAI API</h2>
              <div className={`w-3 h-3 rounded-full ${openaiResult?.success ? 'bg-green-500' : openaiResult?.success === false ? 'bg-red-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Тестирование AI-аналитики статей, генерации выжимок и анализа настроения
            </p>
            
            <button
              onClick={testOpenAI}
              disabled={loading === 'openai'}
              className="btn-primary w-full mb-4"
            >
              {loading === 'openai' ? 'Тестируем...' : 'Тестировать OpenAI'}
            </button>

            {openaiResult && (
              <div className={`p-4 rounded-lg ${openaiResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">
                  {openaiResult.success ? '✅ Успешно!' : '❌ Ошибка'}
                </h3>
                {openaiResult.success ? (
                  <div className="text-sm">
                    <p className="mb-2"><strong>Выжимка:</strong> {openaiResult.data.summary}</p>
                    <p className="mb-2"><strong>Ключевые моменты:</strong> {openaiResult.data.keyPoints.length}</p>
                    <p className="mb-2"><strong>Тренды:</strong> {openaiResult.data.trends.length}</p>
                    <p><strong>Рекомендации:</strong> {openaiResult.data.recommendations.length}</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="mb-2"><strong>Ошибка:</strong> {openaiResult.error}</p>
                    <p><strong>Решение:</strong> {openaiResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">📧 Email</h2>
              <div className={`w-3 h-3 rounded-full ${emailResult?.success ? 'bg-green-500' : emailResult?.success === false ? 'bg-red-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Тестирование отправки email уведомлений и дайджестов
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email для тестирования:
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your@email.com"
              />
            </div>
            
            <button
              onClick={testEmail}
              disabled={loading === 'email'}
              className="btn-primary w-full mb-4"
            >
              {loading === 'email' ? 'Тестируем...' : 'Тестировать Email'}
            </button>

            {emailResult && (
              <div className={`p-4 rounded-lg ${emailResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">
                  {emailResult.success ? '✅ Успешно!' : '❌ Ошибка'}
                </h3>
                {emailResult.success ? (
                  <div className="text-sm">
                    <p className="mb-2"><strong>Получатель:</strong> {emailResult.data.to}</p>
                    <p className="mb-2"><strong>Тема:</strong> {emailResult.data.subject}</p>
                    <p><strong>Отправлено:</strong> {new Date(emailResult.data.sentAt).toLocaleString('ru-RU')}</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="mb-2"><strong>Ошибка:</strong> {emailResult.error}</p>
                    <p><strong>Решение:</strong> {emailResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Telegram */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">📱 Telegram</h2>
              <div className={`w-3 h-3 rounded-full ${telegramResult?.success ? 'bg-green-500' : telegramResult?.success === false ? 'bg-red-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Тестирование отправки Telegram уведомлений
            </p>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Ваш ChatId:</strong> 594250971
              </p>
            </div>
            
            <button
              onClick={testTelegram}
              disabled={loading === 'telegram'}
              className="btn-primary w-full mb-4"
            >
              {loading === 'telegram' ? 'Тестируем...' : 'Тестировать Telegram'}
            </button>

            {telegramResult && (
              <div className={`p-4 rounded-lg ${telegramResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">
                  {telegramResult.success ? '✅ Успешно!' : '❌ Ошибка'}
                </h3>
                {telegramResult.success ? (
                  <div className="text-sm">
                    <p className="mb-2"><strong>Chat ID:</strong> {telegramResult.data.chatId}</p>
                    <p className="mb-2"><strong>Сообщение:</strong> Отправлено</p>
                    <p><strong>Отправлено:</strong> {new Date(telegramResult.data.sentAt).toLocaleString('ru-RU')}</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="mb-2"><strong>Ошибка:</strong> {telegramResult.error}</p>
                    <p><strong>Решение:</strong> {telegramResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Инструкции */}
        <div className="mt-12">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">📋 Инструкции по настройке</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">🔑 OpenAI API</h3>
                <p className="text-gray-600 mb-2">Если тест не прошел:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Проверьте правильность API ключа в .env.local</li>
                  <li>Убедитесь, что ключ начинается с "sk-"</li>
                  <li>Проверьте баланс на https://platform.openai.com/account/billing</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">📧 Email (Gmail)</h3>
                <p className="text-gray-600 mb-2">Если тест не прошел:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Включите двухфакторную аутентификацию в Google</li>
                  <li>Создайте App Password на https://myaccount.google.com/apppasswords</li>
                  <li>Используйте App Password вместо обычного пароля</li>
                  <li>Убедитесь, что SMTP_FROM совпадает с SMTP_USER</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">📱 Telegram Bot</h3>
                <p className="text-gray-600 mb-2">Если тест не прошел:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Создайте бота через @BotFather в Telegram</li>
                  <li>Получите токен и добавьте в .env.local</li>
                  <li>Добавьте бота в чат и получите chatId</li>
                  <li>Используйте правильный chatId для тестирования</li>
                </ul>
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Ваш ChatId:</strong> 594250971 - уже настроен!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 