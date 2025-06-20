'use client';

import { useState } from 'react';

interface AIAnalysisProps {
  articleId?: string;
  articleTitle?: string;
}

interface AnalysisData {
  article: {
    id: string;
    title: string;
    source: string;
    category?: string;
    publishedAt: string;
  };
  analysis: {
    full: string;
    structured: {
      summary: string;
      importance: number;
      sentiment: string;
      keyFacts: string[];
      impact: string;
      context: string;
      keyPlayers: string[];
      trends: string[];
      conclusions: string;
      nextSteps: string;
    };
  };
  metadata: {
    model: string;
    tokens: number;
    includeContext: boolean;
    analyzedAt: string;
  };
}

export default function AIAnalysis({ articleId, articleTitle }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeContext, setIncludeContext] = useState(true);

  const analyzeArticle = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/articles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          includeContext
        })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
      } else {
        setError(data.message || 'Ошибка при анализе статьи');
      }
    } catch (err) {
      setError('Ошибка сети при выполнении анализа');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'text-red-600 bg-red-50 border-red-200';
    if (importance >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопки */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 AI-анализ статьи</h2>
          {articleTitle && (
            <p className="text-gray-600 mt-1">{articleTitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Включить предысторию</span>
          </label>
          
          <button
            onClick={analyzeArticle}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Анализируем...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Анализировать</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-800 font-medium">Ошибка анализа</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          {error.includes('OPENAI_API_KEY') && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Решение:</strong> Добавьте OPENAI_API_KEY в .env.local и перезапустите сервер
              </p>
            </div>
          )}
        </div>
      )}

      {/* Результат анализа */}
      {analysis && (
        <div className="space-y-6">
          {/* Метаданные */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Модель:</span>
                <span className="text-blue-700 ml-2">{analysis.metadata.model}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Токены:</span>
                <span className="text-blue-700 ml-2">{analysis.metadata.tokens}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Контекст:</span>
                <span className="text-blue-700 ml-2">
                  {analysis.metadata.includeContext ? 'Включен' : 'Отключен'}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Время:</span>
                <span className="text-blue-700 ml-2">
                  {new Date(analysis.metadata.analyzedAt).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          </div>

          {/* Структурированные данные */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка */}
            <div className="space-y-4">
              {/* Краткое описание */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Краткое описание</h3>
                <p className="text-gray-700">{analysis.analysis.structured.summary}</p>
              </div>

              {/* Важность и настроение */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">⭐ Важность</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getImportanceColor(analysis.analysis.structured.importance)}`}>
                    {analysis.analysis.structured.importance}/10
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">😊 Настроение</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(analysis.analysis.structured.sentiment)}`}>
                    {getSentimentEmoji(analysis.analysis.structured.sentiment)} {analysis.analysis.structured.sentiment}
                  </div>
                </div>
              </div>

              {/* Ключевые факты */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Ключевые факты</h3>
                <ul className="space-y-2">
                  {analysis.analysis.structured.keyFacts.map((fact, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-gray-700">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Влияние */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🌍 Влияние</h3>
                <p className="text-gray-700">{analysis.analysis.structured.impact}</p>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="space-y-4">
              {/* Предыстория */}
              {analysis.metadata.includeContext && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Предыстория</h3>
                  <p className="text-gray-700">{analysis.analysis.structured.context}</p>
                </div>
              )}

              {/* Ключевые участники */}
              {analysis.analysis.structured.keyPlayers.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 Ключевые участники</h3>
                  <ul className="space-y-1">
                    {analysis.analysis.structured.keyPlayers.map((player, index) => (
                      <li key={index} className="text-gray-700">• {player}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Тренды */}
              {analysis.analysis.structured.trends.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Тренды</h3>
                  <ul className="space-y-1">
                    {analysis.analysis.structured.trends.map((trend, index) => (
                      <li key={index} className="text-gray-700">• {trend}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Выводы */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Выводы</h3>
                <p className="text-gray-700">{analysis.analysis.structured.conclusions}</p>
              </div>

              {/* Что дальше */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔮 Что дальше</h3>
                <p className="text-gray-700">{analysis.analysis.structured.nextSteps}</p>
              </div>
            </div>
          </div>

          {/* Полный анализ */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Полный AI-анализ</h3>
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: analysis.analysis.full.replace(/\n/g, '<br>') 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Инструкция */}
      {!analysis && !loading && !error && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-анализ статей
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Получите глубокий анализ любой статьи с контекстом, предысторией и прогнозами развития событий
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✅ Анализ важности и настроения</p>
              <p>✅ Ключевые факты и участники</p>
              <p>✅ Исторический контекст</p>
              <p>✅ Прогнозы и выводы</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 