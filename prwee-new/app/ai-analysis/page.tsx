'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AIAnalysis from '@/components/AIAnalysis';

interface Article {
  _id: string;
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: {
    name: string;
  };
}

export default function AIAnalysisPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
        // Выбираем первую статью по умолчанию
        if (data.data.length > 0) {
          setSelectedArticle(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
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
            🤖 AI-анализ новостей
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Получите глубокий анализ любой статьи с контекстом, предысторией и прогнозами развития событий
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список статей */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📰 Выберите статью для анализа
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {articles.map((article) => (
                  <div
                    key={article._id}
                    onClick={() => setSelectedArticle(article)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedArticle?._id === article._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{article.source.name}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {article.category && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Нет доступных статей для анализа</p>
                </div>
              )}
            </div>

            {/* Статистика */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Всего статей:</span>
                  <span className="font-medium">{articles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Категорий:</span>
                  <span className="font-medium">
                    {Array.from(new Set(articles.map(a => a.category?.name || 'Общее'))).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Источников:</span>
                  <span className="font-medium">
                    {Array.from(new Set(articles.map(a => a.source.name))).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Информация об AI */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 О AI-анализе</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Анализ важности и настроения</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Извлечение ключевых фактов</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Исторический контекст</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Прогнозы развития событий</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>Связи с другими темами</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI-анализ */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <AIAnalysis 
                articleId={selectedArticle._id}
                articleTitle={selectedArticle.title}
              />
            ) : (
              <div className="card">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Выберите статью для анализа
                  </h3>
                  <p className="text-gray-600">
                    Выберите статью из списка слева, чтобы получить AI-анализ с контекстом и предысторией
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-12">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">💡 Как работает AI-анализ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Анализ контента</h3>
                <p className="text-gray-600 text-sm">
                  AI анализирует заголовок, содержание и метаданные статьи для понимания сути
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-semibold text-gray-900 mb-2">Контекст и предыстория</h3>
                <p className="text-gray-600 text-sm">
                  Система предоставляет исторический контекст и объясняет предысторию событий
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">🔮</div>
                <h3 className="font-semibold text-gray-900 mb-2">Прогнозы и выводы</h3>
                <p className="text-gray-600 text-sm">
                  AI делает прогнозы развития событий и предлагает выводы для размышления
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 