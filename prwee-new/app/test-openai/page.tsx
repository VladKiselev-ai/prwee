'use client';

import { useState } from 'react';
import Header from '@/components/Header';

export default function TestOpenAIPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOpenAI = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/test/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Привет, это тест OpenAI API'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(data);
      } else {
        setError(data.message || 'Ошибка при тестировании OpenAI API');
      }
    } catch (err) {
      setError('Ошибка сети при тестировании OpenAI API');
    } finally {
      setLoading(false);
    }
  };

  const testArticleAnalysis = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/articles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeContext: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult(data);
      } else {
        setError(data.message || 'Ошибка при анализе статьи');
      }
    } catch (err) {
      setError('Ошибка сети при анализе статьи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Тест OpenAI API
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Проверка работоспособности OpenAI API и AI-анализа статей
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Тест простого OpenAI API */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🔧 Тест OpenAI API
            </h2>
            <p className="text-gray-600 mb-6">
              Простой тест для проверки подключения к OpenAI API
            </p>
            
            <button
              onClick={testOpenAI}
              disabled={loading}
              className="btn-primary mb-6"
            >
              {loading ? 'Тестируем...' : '🧪 Тест OpenAI API'}
            </button>

            {testResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Успешный тест</h3>
                <pre className="text-sm text-green-800 overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Тест анализа статьи */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              📊 Тест AI-анализа статьи
            </h2>
            <p className="text-gray-600 mb-6">
              Тест полного AI-анализа статьи с контекстом и предысторией
            </p>
            
            <button
              onClick={testArticleAnalysis}
              disabled={loading}
              className="btn-primary mb-6"
            >
              {loading ? 'Анализируем...' : '🤖 Тест AI-анализа'}
            </button>

            {testResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Успешный анализ</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-green-800">Статья:</span>
                    <span className="text-green-700 ml-2">{testResult.data?.article?.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Краткое описание:</span>
                    <span className="text-green-700 ml-2">{testResult.data?.analysis?.structured?.summary}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Важность:</span>
                    <span className="text-green-700 ml-2">{testResult.data?.analysis?.structured?.importance}/10</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Настроение:</span>
                    <span className="text-green-700 ml-2">{testResult.data?.analysis?.structured?.sentiment}</span>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium text-green-800">
                      📋 Полный ответ API
                    </summary>
                    <pre className="text-xs text-green-700 mt-2 overflow-auto max-h-96">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="card bg-red-50 border border-red-200">
              <h3 className="text-xl font-semibold text-red-900 mb-4">
                ❌ Ошибка тестирования
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              
              {error.includes('403') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">🌍 Проблема с регионом</h4>
                  <p className="text-yellow-800 text-sm mb-3">
                    Ошибка 403 "Country, region, or territory not supported" означает, что OpenAI API недоступен в вашем регионе.
                  </p>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p><strong>Возможные решения:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Использовать VPN для доступа к OpenAI API</li>
                      <li>Проверить настройки прокси</li>
                      <li>Обратиться в поддержку OpenAI</li>
                      <li>Использовать альтернативные AI-сервисы</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {error.includes('401') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">🔑 Проблема с API ключом</h4>
                  <p className="text-yellow-800 text-sm">
                    Проверьте, что OpenAI API ключ правильно добавлен в .env.local и сервер перезапущен.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Информация о статусе */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              📋 Статус системы
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">✅ Работает</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• RSS агрегация новостей</li>
                  <li>• Веб-интерфейс</li>
                  <li>• API получения статей</li>
                  <li>• Система мониторинга</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🔧 Требует настройки</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• OpenAI API (географические ограничения)</li>
                  <li>• Telegram Bot (для уведомлений)</li>
                  <li>• Email SMTP (для рассылок)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ссылки */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🔗 Полезные ссылки
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/ai-analysis"
                className="btn-secondary text-center"
              >
                🤖 AI-анализ статей
              </a>
              <a
                href="/test-api"
                className="btn-secondary text-center"
              >
                🔧 Тест API
              </a>
              <a
                href="/"
                className="btn-secondary text-center"
              >
                🏠 Главная страница
              </a>
              <a
                href="/monitoring"
                className="btn-secondary text-center"
              >
                📊 Мониторинг
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 