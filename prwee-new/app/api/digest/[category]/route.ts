import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { format, subDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const categorySlug = params.category;
    
    // Находим категорию
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Получаем дату начала периода
    const startDate = subDays(new Date(), days);
    
    // Получаем статьи за указанный период
    const articles = await Article.find({
      category: category._id,
      publishedAt: { $gte: startDate },
      isActive: true,
    })
      .sort({ importance: -1, publishedAt: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('source', 'name url logo');
    
    // Группируем статьи по важности
    const importantArticles = articles.filter(article => article.importance >= 7);
    const regularArticles = articles.filter(article => article.importance < 7);
    
    // Генерируем краткое резюме
    const summary = generateDigestSummary(articles, category.name, days);
    
    // Статистика
    const stats = {
      totalArticles: articles.length,
      importantArticles: importantArticles.length,
      regularArticles: regularArticles.length,
      sources: Array.from(new Set(articles.map(article => article.source?.name).filter(Boolean))),
      averageImportance: articles.length > 0 
        ? (articles.reduce((sum, article) => sum + article.importance, 0) / articles.length).toFixed(1)
        : 0,
    };
    
    const digest = {
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
      },
      period: {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        days,
      },
      summary,
      stats,
      articles: {
        important: importantArticles,
        regular: regularArticles,
      },
      generatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: digest,
    });
  } catch (error) {
    console.error('Error generating digest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate digest' },
      { status: 500 }
    );
  }
}

function generateDigestSummary(articles: any[], categoryName: string, days: number): string {
  if (articles.length === 0) {
    return `За последние ${days} ${days === 1 ? 'день' : 'дней'} в категории "${categoryName}" не было опубликовано новых статей.`;
  }
  
  const importantCount = articles.filter(article => article.importance >= 7).length;
  const sources = Array.from(new Set(articles.map(article => article.source?.name).filter(Boolean)));
  
  let summary = `За последние ${days} ${days === 1 ? 'день' : 'дней'} в категории "${categoryName}" `;
  summary += `было опубликовано ${articles.length} статей`;
  
  if (importantCount > 0) {
    summary += `, из которых ${importantCount} являются важными`;
  }
  
  if (sources.length > 0) {
    summary += `. Источники: ${sources.slice(0, 3).join(', ')}`;
    if (sources.length > 3) {
      summary += ` и еще ${sources.length - 3}`;
    }
  }
  
  summary += '.';
  
  return summary;
} 