'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  rssSources: any[];
}

export default function DemoPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Загружаем категории...');
      const response = await fetch('/api/categories');
      console.log('Ответ получен:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Данные получены:', data);
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error || 'Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
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
            Демонстрация новостного агрегатора
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Проверка работы API и компонентов
          </p>
        </div>

        {/* Статус загрузки */}
        <div className="mb-8">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Статус API</h2>
            {loading && (
              <div className="text-blue-600">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                Загрузка категорий...
              </div>
            )}
            {error && (
              <div className="text-red-600">
                ❌ Ошибка: {error}
              </div>
            )}
            {!loading && !error && (
              <div className="text-green-600">
                ✅ API работает! Загружено категорий: {categories.length}
              </div>
            )}
          </div>
        </div>

        {/* Список категорий */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="card card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div className="text-sm text-gray-500">
                    RSS: {category.rssSources.length}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>

                <div className="text-sm text-gray-500">
                  Slug: {category.slug}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Тест API */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Тест API</h2>
            <button 
              onClick={fetchCategories}
              className="btn-primary"
            >
              Обновить данные
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 