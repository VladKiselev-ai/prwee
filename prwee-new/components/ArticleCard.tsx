'use client';

import { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, Clock, User } from 'lucide-react';
import { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ArticleCardProps {
  article: Article;
  showMonitorButton?: boolean;
  onMonitorToggle?: (articleId: string, isMonitored: boolean) => void;
}

export default function ArticleCard({ 
  article, 
  showMonitorButton = true,
  onMonitorToggle 
}: ArticleCardProps) {
  const [isMonitoring, setIsMonitoring] = useState(article.isMonitored);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleMonitorToggle = async () => {
    if (!showMonitorButton) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/articles/monitor', {
        method: isMonitoring ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article._id,
          userId: 'current-user-id', // В реальном приложении получать из контекста
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsMonitoring(!isMonitoring);
        onMonitorToggle?.(article._id, !isMonitoring);
        toast.success(
          isMonitoring 
            ? 'Статья удалена из мониторинга' 
            : 'Статья добавлена в мониторинг'
        );
      } else {
        toast.error(data.error || 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error toggling monitor:', error);
      toast.error('Произошла ошибка при обновлении мониторинга');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/articles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article._id,
          includeContext: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
        setShowAnalysis(true);
      }
    } catch (error) {
      console.error('Error analyzing article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentBadge = () => {
    const sentimentClasses = {
      positive: 'badge-positive',
      negative: 'badge-negative',
      neutral: 'badge-neutral',
    };
    
    return (
      <span className={`badge ${sentimentClasses[article.sentiment]}`}>
        {article.sentiment === 'positive' && 'Позитивно'}
        {article.sentiment === 'negative' && 'Негативно'}
        {article.sentiment === 'neutral' && 'Нейтрально'}
      </span>
    );
  };

  const getImportanceBadge = () => {
    if (article.importance >= 8) {
      return <span className="badge badge-important">Важно</span>;
    } else if (article.importance >= 6) {
      return <span className="badge badge-regular">Интересно</span>;
    }
    return null;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    if (importance >= 8) return 'bg-red-100 text-red-800';
    if (importance >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="card card-hover">
      {article.image && (
        <div className="mb-4">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            {formatDistanceToNow(new Date(article.publishedAt), { 
              addSuffix: true, 
              locale: ru 
            })}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getImportanceBadge()}
          {getSentimentBadge()}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {article.title}
      </h3>

      {article.summary && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {article.author && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          )}
          
          {article.readingTime > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime} мин</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(article.importance)}`}>
            ⭐ {article.importance}/10
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
            {getSentimentEmoji(article.sentiment)} {article.sentiment}
          </span>
        </div>
      </div>

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex items-center space-x-2"
        >
          <span>Читать</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {showMonitorButton && (
          <button
            onClick={handleMonitorToggle}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isMonitoring
                ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isMonitoring ? 'Удалить из мониторинга' : 'Добавить в мониторинг'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isMonitoring ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}

        <button
          onClick={analyzeArticle}
          disabled={isLoading}
          className="btn-primary text-sm flex items-center space-x-1"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Анализ...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>AI-анализ</span>
            </>
          )}
        </button>
      </div>

      {/* AI-анализ */}
      {showAnalysis && analysis && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">🤖 AI-анализ</h4>
            <button
              onClick={() => setShowAnalysis(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-blue-800">Кратко:</span>
              <span className="text-blue-700 ml-2">{analysis.analysis.structured.summary}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <span className="font-medium text-blue-800">Важность:</span>
                <span className="text-blue-700 ml-1">{analysis.analysis.structured.importance}/10</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Влияние:</span>
                <span className="text-blue-700 ml-1">{analysis.analysis.structured.impact.substring(0, 50)}...</span>
              </div>
            </div>
            
            {analysis.analysis.structured.context && (
              <div>
                <span className="font-medium text-blue-800">Контекст:</span>
                <span className="text-blue-700 ml-2">{analysis.analysis.structured.context.substring(0, 100)}...</span>
              </div>
            )}
            
            <div className="pt-2">
              <a
                href={`/ai-analysis?article=${article._id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                📊 Полный анализ →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 