import OpenAI from 'openai';
import dbConnect from './database';
import Article from '@/models/Article';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SummaryRequest {
  articles: any[];
  category: string;
  period: string;
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  trends: string[];
  recommendations: string[];
}

export async function generateAISummary(request: SummaryRequest): Promise<SummaryResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { articles, category, period } = request;

    if (articles.length === 0) {
      return {
        summary: `За период ${period} в категории "${category}" не было опубликовано новых статей.`,
        keyPoints: [],
        trends: [],
        recommendations: [],
      };
    }

    // Подготавливаем контент для анализа
    const articlesText = articles
      .map((article, index) => {
        return `${index + 1}. ${article.title}\n${article.summary || article.content.substring(0, 200)}...\n`;
      })
      .join('\n');

    const prompt = `
Проанализируй следующие новости из категории "${category}" за период ${period}:

${articlesText}

Создай краткую аналитическую выжимку, которая включает:

1. ОБЩЕЕ РЕЗЮМЕ (2-3 предложения): Основные события и тренды
2. КЛЮЧЕВЫЕ МОМЕНТЫ (3-5 пунктов): Самые важные новости
3. ТРЕНДЫ (2-3 пункта): Наметившиеся тенденции
4. РЕКОМЕНДАЦИИ (2-3 пункта): Что стоит отслеживать в ближайшее время

Формат ответа должен быть структурированным и информативным. Используй русский язык.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты - опытный аналитик новостей. Твоя задача - создавать краткие, информативные и структурированные выжимки новостей.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Парсим ответ для извлечения структурированных данных
    const parsed = parseAIResponse(response);

    return {
      summary: parsed.summary,
      keyPoints: parsed.keyPoints,
      trends: parsed.trends,
      recommendations: parsed.recommendations,
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Fallback: создаем простую выжимку без AI
    return generateFallbackSummary(request);
  }
}

function parseAIResponse(response: string): SummaryResponse {
  const lines = response.split('\n').filter(line => line.trim());
  
  let summary = '';
  const keyPoints: string[] = [];
  const trends: string[] = [];
  const recommendations: string[] = [];
  
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('резюме') || lowerLine.includes('общее')) {
      currentSection = 'summary';
      continue;
    } else if (lowerLine.includes('ключевые') || lowerLine.includes('моменты')) {
      currentSection = 'keyPoints';
      continue;
    } else if (lowerLine.includes('тренды') || lowerLine.includes('тенденции')) {
      currentSection = 'trends';
      continue;
    } else if (lowerLine.includes('рекомендации')) {
      currentSection = 'recommendations';
      continue;
    }
    
    // Убираем номера и маркеры
    const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim();
    
    if (!cleanLine) continue;
    
    switch (currentSection) {
      case 'summary':
        summary += cleanLine + ' ';
        break;
      case 'keyPoints':
        if (cleanLine.length > 10) keyPoints.push(cleanLine);
        break;
      case 'trends':
        if (cleanLine.length > 10) trends.push(cleanLine);
        break;
      case 'recommendations':
        if (cleanLine.length > 10) recommendations.push(cleanLine);
        break;
    }
  }
  
  return {
    summary: summary.trim(),
    keyPoints: keyPoints.slice(0, 5),
    trends: trends.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
  };
}

function generateFallbackSummary(request: SummaryRequest): SummaryResponse {
  const { articles, category, period } = request;
  
  const importantArticles = articles.filter(article => article.importance >= 7);
  const sources = Array.from(new Set(articles.map(article => article.source?.name).filter(Boolean)));
  
  let summary = `За период ${period} в категории "${category}" было опубликовано ${articles.length} статей`;
  
  if (importantArticles.length > 0) {
    summary += `, из которых ${importantArticles.length} являются важными`;
  }
  
  if (sources.length > 0) {
    summary += `. Основные источники: ${sources.slice(0, 3).join(', ')}`;
  }
  
  summary += '.';
  
  const keyPoints = importantArticles
    .slice(0, 3)
    .map(article => article.title);
  
  const trends = [
    `Активность источников: ${sources.length} источников`,
    `Средняя важность статей: ${(articles.reduce((sum, article) => sum + article.importance, 0) / articles.length).toFixed(1)}/10`,
  ];
  
  const recommendations = [
    'Отслеживайте обновления в ключевых источниках',
    'Обратите внимание на статьи с высокой важностью',
  ];
  
  return {
    summary,
    keyPoints,
    trends,
    recommendations,
  };
}

export async function updateArticleSummaries(): Promise<void> {
  try {
    await dbConnect();
    
    // Получаем статьи без AI-выжимок
    const articles = await Article.find({
      summary: { $exists: false },
      content: { $exists: true, $ne: '' },
    }).limit(50); // Ограничиваем количество для экономии API вызовов
    
    for (const article of articles) {
      try {
        const aiSummary = await generateAISummary({
          articles: [article],
          category: article.category?.name || 'Общие новости',
          period: 'сегодня',
        });
        
        article.summary = aiSummary.summary;
        await article.save();
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error updating summary for article ${article._id}:`, error);
      }
    }
    
    console.log(`Updated summaries for ${articles.length} articles`);
  } catch (error) {
    console.error('Error updating article summaries:', error);
  }
} 