'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import ArticleCard from '@/components/ArticleCard';
import { Category, Article } from '@/types';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchArticles(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async (category?: string) => {
    setArticlesLoading(true);
    try {
      const url = category 
        ? `/api/articles?category=${category}&limit=10`
        : '/api/articles?limit=10';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setArticlesLoading(false);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  const handleShowAll = () => {
    setSelectedCategory(null);
    fetchArticles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Новостной агрегатор
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ежедневные выжимки новостей по тематикам с аналитикой и системой мониторинга
          </p>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Категории новостей</h2>
            {selectedCategory && (
              <button
                onClick={handleShowAll}
                className="btn-secondary"
              >
                Показать все
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onClick={() => handleCategoryClick(category.slug)}
                isSelected={selectedCategory === category.slug}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedCategory 
                ? `Новости: ${categories.find(c => c.slug === selectedCategory)?.name}`
                : 'Последние новости'
              }
            </h2>
            <div className="text-sm text-gray-500">
              {articles.length} статей
            </div>
          </div>

          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  onMonitorToggle={() => {
                    console.log('Toggle monitoring for:', article.title);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {selectedCategory 
                  ? 'Нет новостей в этой категории'
                  : 'Нет доступных новостей'
                }
              </div>
              <button
                onClick={() => fetchArticles(selectedCategory || undefined)}
                className="btn-primary mt-4"
              >
                Обновить
              </button>
            </div>
          )}
        </section>

        {/* Новые возможности */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🚀 Новые возможности
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Расширенная аналитика и AI-функции для глубокого понимания новостей
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI-анализ */}
              <div className="card hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-5xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-анализ статей</h3>
                  <p className="text-gray-600 mb-4">
                    Глубокий анализ любой статьи с контекстом, предысторией и прогнозами развития событий
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Анализ важности и настроения</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Исторический контекст</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Прогнозы развития событий</span>
                    </div>
                  </div>
                  <a
                    href="/ai-analysis"
                    className="btn-primary w-full"
                  >
                    🧠 Попробовать AI-анализ
                  </a>
                </div>
              </div>

              {/* Мониторинг */}
              <div className="card hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Система мониторинга</h3>
                  <p className="text-gray-600 mb-4">
                    Отслеживайте важные статьи и получайте уведомления о новых публикациях
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Отметка важных статей</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Уведомления в Telegram</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Email рассылки</span>
                    </div>
                  </div>
                  <a
                    href="/monitoring"
                    className="btn-secondary w-full"
                  >
                    📈 Управление мониторингом
                  </a>
                </div>
              </div>

              {/* RSS агрегация */}
              <div className="card hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-5xl mb-4">📰</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">RSS агрегация</h3>
                  <p className="text-gray-600 mb-4">
                    Автоматический сбор новостей из множества источников с категоризацией
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Реальные новости</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Автоматическая категоризация</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span>Фильтрация по темам</span>
                    </div>
                  </div>
                  <a
                    href="/demo"
                    className="btn-secondary w-full"
                  >
                    🔄 Посмотреть демо
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 