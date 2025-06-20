'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { MonitoredArticle } from '@/types';
import { Bookmark, Filter, Search } from 'lucide-react';

export default function MonitoringPage() {
  const [monitoredArticles, setMonitoredArticles] = useState<MonitoredArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterImportance, setFilterImportance] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  useEffect(() => {
    fetchMonitoredArticles();
  }, []);

  const fetchMonitoredArticles = async () => {
    try {
      // В реальном приложении здесь будет API для получения отслеживаемых статей
      // Пока используем моковые данные
      const mockArticles: MonitoredArticle[] = [
        {
          article: {
            _id: '1',
            title: 'Важная новость о технологиях',
            content: 'Содержание статьи...',
            summary: 'Краткое описание важной новости о технологиях',
            url: 'https://example.com/article1',
            source: { name: 'TechNews', url: 'https://technews.com' },
            category: { _id: '1', name: 'Технологии', slug: 'tech', description: '', icon: '💻', color: '#3b82f6', isActive: true, rssSources: [], createdAt: '', updatedAt: '' },
            tags: ['технологии', 'инновации'],
            publishedAt: new Date().toISOString(),
            image: '',
            author: 'Иван Петров',
            readingTime: 5,
            sentiment: 'positive' as const,
            importance: 9,
            isMonitored: true,
            monitoredBy: ['user1'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          addedAt: new Date().toISOString(),
          notes: 'Интересная статья для отслеживания',
        },
        // Добавьте больше моковых статей здесь
      ];
      
      setMonitoredArticles(mockArticles);
    } catch (error) {
      console.error('Error fetching monitored articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = monitoredArticles.filter(({ article }) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesImportance = filterImportance === 'all' || 
                             (filterImportance === 'high' && article.importance >= 8) ||
                             (filterImportance === 'medium' && article.importance >= 5 && article.importance < 8) ||
                             (filterImportance === 'low' && article.importance < 5);
    
    const matchesSentiment = filterSentiment === 'all' || article.sentiment === filterSentiment;
    
    return matchesSearch && matchesImportance && matchesSentiment;
  });

  const handleMonitorToggle = (articleId: string, isMonitored: boolean) => {
    if (!isMonitored) {
      setMonitoredArticles(prev => 
        prev.filter(item => item.article._id !== articleId)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Bookmark className="w-6 h-6 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Отслеживаемые статьи
            </h1>
          </div>
          
          <p className="text-gray-600">
            Управляйте статьями, которые вы хотите отслеживать для получения обновлений
          </p>
        </div>

        {/* Фильтры и поиск */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск статей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterImportance}
              onChange={(e) => setFilterImportance(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Все по важности</option>
              <option value="high">Высокая важность</option>
              <option value="medium">Средняя важность</option>
              <option value="low">Низкая важность</option>
            </select>
            
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Все настроения</option>
              <option value="positive">Позитивные</option>
              <option value="negative">Негативные</option>
              <option value="neutral">Нейтральные</option>
            </select>
            
            <button className="btn-secondary flex items-center justify-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Сбросить</span>
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">
              {monitoredArticles.length}
            </div>
            <div className="text-gray-600">Всего отслеживаемых</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {monitoredArticles.filter(({ article }) => article.sentiment === 'positive').length}
            </div>
            <div className="text-gray-600">Позитивных</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {monitoredArticles.filter(({ article }) => article.importance >= 8).length}
            </div>
            <div className="text-gray-600">Важных</div>
          </div>
          
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {monitoredArticles.filter(({ article }) => article.updatedAt > article.publishedAt).length}
            </div>
            <div className="text-gray-600">Обновленных</div>
          </div>
        </div>

        {/* Список статей */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(({ article, notes }) => (
              <div key={article._id} className="relative">
                <ArticleCard 
                  article={article}
                  onMonitorToggle={handleMonitorToggle}
                />
                {notes && (
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Заметка
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterImportance !== 'all' || filterSentiment !== 'all'
                ? 'Статьи не найдены'
                : 'Нет отслеживаемых статей'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterImportance !== 'all' || filterSentiment !== 'all'
                ? 'Попробуйте изменить параметры поиска'
                : 'Добавьте статьи в мониторинг, чтобы отслеживать их обновления'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 