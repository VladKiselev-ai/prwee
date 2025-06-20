'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  importance: number;
  sentiment: string;
  summary?: string;
  category?: {
    name: string;
  };
  source: {
    name: string;
  };
}

export default function TestNotificationsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationResult, setNotificationResult] = useState<any>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTelegramNotification = async (type: 'digest' | 'important' | 'general') => {
    setSending(true);
    setNotificationResult(null);

    try {
      let articlesToSend = articles;
      
      if (type === 'important') {
        // Отправляем только важные статьи
        articlesToSend = articles.filter(article => article.importance >= 8).slice(0, 1);
        if (articlesToSend.length === 0) {
          setNotificationResult({
            success: false,
            error: 'No important articles found',
            message: 'Нет статей с важностью 8+ для отправки'
          });
          return;
        }
      } else if (type === 'digest') {
        // Отправляем последние 10 статей для дайджеста
        articlesToSend = articles.slice(0, 10);
      } else {
        // Отправляем последние 5 статей
        articlesToSend = articles.slice(0, 5);
      }

      const response = await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: articlesToSend,
          type
        })
      });

      const data = await response.json();
      setNotificationResult(data);
    } catch (error) {
      setNotificationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Ошибка при отправке уведомления'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загружаем статьи...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Тестирование уведомлений
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Отправка уведомлений в Telegram с реальными данными статей
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">{articles.length}</div>
            <div className="text-gray-600">Всего статей</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">
              {articles.filter(a => a.importance >= 8).length}
            </div>
            <div className="text-gray-600">Важных (8+)</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">
              {articles.filter(a => a.importance >= 7).length}
            </div>
            <div className="text-gray-600">Интересных (7+)</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Array.from(new Set(articles.map(a => a.category?.name || 'Общее'))).length}
            </div>
            <div className="text-gray-600">Категорий</div>
          </div>
        </div>

        {/* Кнопки уведомлений */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">📱 Telegram уведомления</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => sendTelegramNotification('important')}
              disabled={sending}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Отправляем...</span>
                </>
              ) : (
                <>
                  <span>🚨</span>
                  <span>Важная новость</span>
                </>
              )}
            </button>

            <button
              onClick={() => sendTelegramNotification('digest')}
              disabled={sending}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Отправляем...</span>
                </>
              ) : (
                <>
                  <span>📰</span>
                  <span>Дайджест</span>
                </>
              )}
            </button>

            <button
              onClick={() => sendTelegramNotification('general')}
              disabled={sending}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Отправляем...</span>
                </>
              ) : (
                <>
                  <span>📢</span>
                  <span>Новые новости</span>
                </>
              )}
            </button>
          </div>

          {/* Результат */}
          {notificationResult && (
            <div className={`mt-6 p-4 rounded-lg ${notificationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-semibold mb-2">
                {notificationResult.success ? '✅ Успешно отправлено!' : '❌ Ошибка отправки'}
              </h3>
              {notificationResult.success ? (
                <div className="text-sm">
                  <p className="mb-2"><strong>Chat ID:</strong> {notificationResult.data.chatId}</p>
                  <p className="mb-2"><strong>Тип:</strong> {notificationResult.data.type}</p>
                  <p className="mb-2"><strong>Статей отправлено:</strong> {notificationResult.data.articlesCount}</p>
                  <p><strong>Время:</strong> {new Date(notificationResult.data.sentAt).toLocaleString('ru-RU')}</p>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="mb-2"><strong>Ошибка:</strong> {notificationResult.error}</p>
                  <p><strong>Решение:</strong> {notificationResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Список статей */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">📋 Доступные статьи</h2>
          
          <div className="space-y-4">
            {articles.slice(0, 10).map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                        {article.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {article.summary || article.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📰 {article.source.name}</span>
                      <span>📅 {new Date(article.publishedAt).toLocaleDateString('ru-RU')}</span>
                      <span>🏷️ {article.category?.name || 'Общее'}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      article.importance >= 8 ? 'bg-red-100 text-red-800' :
                      article.importance >= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      ⭐ {article.importance}/10
                    </div>
                    <div className={`mt-1 px-2 py-1 rounded text-xs ${
                      article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {article.sentiment === 'positive' ? '😊' : 
                       article.sentiment === 'negative' ? '😔' : '😐'} {article.sentiment}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {articles.length > 10 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Показано 10 из {articles.length} статей
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 