import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['dc:creator', 'author'],
      ['content:encoded', 'content'],
    ],
  },
});

// RSS источники для получения реальных новостей
const rssSources = [
  {
    name: 'РИА Новости',
    url: 'https://ria.ru/export/rss2/index.xml',
    category: 'politics'
  },
  {
    name: 'ТАСС',
    url: 'https://tass.ru/rss/v2.xml',
    category: 'politics'
  },
  {
    name: 'Интерфакс',
    url: 'https://www.interfax.ru/rss.asp',
    category: 'politics'
  },
  {
    name: 'Коммерсантъ',
    url: 'https://www.kommersant.ru/RSS/news.xml',
    category: 'economy'
  },
  {
    name: 'РБК',
    url: 'https://www.rbc.ru/rss/free/main.xml',
    category: 'economy'
  },
  {
    name: 'Ведомости',
    url: 'https://www.vedomosti.ru/rss/news',
    category: 'economy'
  },
  {
    name: '3DNews',
    url: 'https://3dnews.ru/news/rss/',
    category: 'technology'
  },
  {
    name: 'IXBT',
    url: 'https://www.ixbt.com/news/rss/',
    category: 'technology'
  },
  {
    name: 'Хабрахабр',
    url: 'https://habr.com/ru/rss/all/all/',
    category: 'technology'
  },
  {
    name: 'CNews',
    url: 'https://www.cnews.ru/inc/rss/news.xml',
    category: 'technology'
  },
  {
    name: 'Спорт-Экспресс',
    url: 'https://www.sport-express.ru/rss.xml',
    category: 'sports'
  },
  {
    name: 'Советский спорт',
    url: 'https://www.sovsport.ru/rss.xml',
    category: 'sports'
  },
  {
    name: 'Чемпионат',
    url: 'https://www.championat.com/rss/news.xml',
    category: 'sports'
  },
  {
    name: 'N+1',
    url: 'https://nplus1.ru/rss',
    category: 'science'
  },
  {
    name: 'Элементы',
    url: 'https://elementy.ru/rss/news',
    category: 'science'
  },
  {
    name: 'Indicator',
    url: 'https://indicator.ru/rss',
    category: 'science'
  },
  {
    name: 'ForkLog',
    url: 'https://forklog.com/feed/',
    category: 'cryptocurrency'
  },
  {
    name: 'Bits.media',
    url: 'https://bits.media/rss/',
    category: 'cryptocurrency'
  },
  {
    name: 'CoinSpot',
    url: 'https://coinspot.io/feed/',
    category: 'cryptocurrency'
  },
  {
    name: 'Лента.ру',
    url: 'https://lenta.ru/rss',
    category: 'general'
  },
  {
    name: 'Газета.ру',
    url: 'https://www.gazeta.ru/export/rss/lenta.xml',
    category: 'general'
  },
  {
    name: 'Известия',
    url: 'https://iz.ru/xml/rss/all.xml',
    category: 'general'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    
    let articles: any[] = [];
    
    // Фильтруем источники по категории, если указана
    const sourcesToFetch = category 
      ? rssSources.filter(source => source.category === category)
      : rssSources;
    
    // Получаем статьи из всех источников
    for (const source of sourcesToFetch) {
      try {
        console.log(`Загружаем RSS из: ${source.name} (${source.url})`);
        const feed = await parser.parseURL(source.url);
        
        const sourceArticles = feed.items.slice(0, 10).map((item, index) => ({
          _id: `${source.name}-${Date.now()}-${index}`,
          title: item.title || 'Без заголовка',
          content: item.contentSnippet || item.content || item.summary || 'Содержание недоступно',
          summary: item.contentSnippet || item.summary || 'Краткое описание недоступно',
          url: item.link || '#',
          source: {
            name: source.name,
            url: feed.link || source.url,
            logo: feed.image?.url || undefined
          },
          category: {
            _id: source.category,
            name: source.category === 'technology' ? 'Технологии' :
                  source.category === 'politics' ? 'Политика' :
                  source.category === 'economy' ? 'Экономика' :
                  source.category === 'cryptocurrency' ? 'Криптовалюты' :
                  source.category === 'sports' ? 'Спорт' :
                  source.category === 'science' ? 'Наука' :
                  source.category === 'general' ? 'Общие новости' : 'Общее',
            slug: source.category,
            description: '',
            icon: source.category === 'technology' ? '💻' :
                   source.category === 'politics' ? '🏛️' :
                   source.category === 'economy' ? '💰' :
                   source.category === 'cryptocurrency' ? '₿' :
                   source.category === 'sports' ? '⚽' :
                   source.category === 'science' ? '🔬' :
                   source.category === 'general' ? '📰' : '📰',
            color: source.category === 'technology' ? '#3b82f6' :
                   source.category === 'politics' ? '#ef4444' :
                   source.category === 'economy' ? '#10b981' :
                   source.category === 'cryptocurrency' ? '#f59e0b' :
                   source.category === 'sports' ? '#8b5cf6' :
                   source.category === 'science' ? '#06b6d4' :
                   source.category === 'general' ? '#6b7280' : '#3b82f6',
            isActive: true,
            rssSources: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          tags: item.categories || [],
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          author: item.creator || item.author || feed.creator || 'Неизвестный автор',
          image: item.thumbnail || item.media || '',
          sentiment: 'neutral' as const,
          importance: Math.floor(Math.random() * 10) + 1,
          isMonitored: false,
          readingTime: Math.ceil((item.contentSnippet || '').length / 200),
          monitoredBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        articles.push(...sourceArticles);
      } catch (error) {
        console.error(`Ошибка при загрузке RSS из ${source.name}:`, error);
        // Добавляем заглушку для демонстрации
        articles.push({
          _id: `${source.name}-demo-${Date.now()}`,
          title: `Демо статья из ${source.name}`,
          content: 'Это демонстрационная статья. Для получения реальных новостей настройте RSS источники.',
          summary: 'Демонстрационная статья',
          url: '#',
          source: {
            name: source.name,
            url: source.url,
            logo: undefined
          },
          category: {
            _id: source.category,
            name: source.category === 'technology' ? 'Технологии' :
                  source.category === 'politics' ? 'Политика' :
                  source.category === 'economy' ? 'Экономика' :
                  source.category === 'cryptocurrency' ? 'Криптовалюты' :
                  source.category === 'sports' ? 'Спорт' :
                  source.category === 'science' ? 'Наука' :
                  source.category === 'general' ? 'Общие новости' : 'Общее',
            slug: source.category,
            description: '',
            icon: source.category === 'technology' ? '💻' :
                   source.category === 'politics' ? '🏛️' :
                   source.category === 'economy' ? '💰' :
                   source.category === 'cryptocurrency' ? '₿' :
                   source.category === 'sports' ? '⚽' :
                   source.category === 'science' ? '🔬' :
                   source.category === 'general' ? '📰' : '📰',
            color: source.category === 'technology' ? '#3b82f6' :
                   source.category === 'politics' ? '#ef4444' :
                   source.category === 'economy' ? '#10b981' :
                   source.category === 'cryptocurrency' ? '#f59e0b' :
                   source.category === 'sports' ? '#8b5cf6' :
                   source.category === 'science' ? '#06b6d4' :
                   source.category === 'general' ? '#6b7280' : '#3b82f6',
            isActive: true,
            rssSources: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          tags: ['demo'],
          publishedAt: new Date().toISOString(),
          author: 'Демо',
          image: '',
          sentiment: 'neutral' as const,
          importance: 5,
          isMonitored: false,
          readingTime: 2,
          monitoredBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    // Сортируем по дате публикации (новые сначала)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articles.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedArticles,
      pagination: {
        page,
        limit,
        total: articles.length,
        totalPages: Math.ceil(articles.length / limit),
        hasNext: endIndex < articles.length,
        hasPrev: page > 1
      },
      meta: {
        sources: sourcesToFetch.length,
        category: category || 'all'
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, url, source, category } = body;
    
    if (!title || !content || !url) {
      return NextResponse.json(
        { success: false, error: 'Title, content and URL are required' },
        { status: 400 }
      );
    }
    
    const newArticle = {
      _id: `manual-${Date.now()}`,
      title,
      content,
      summary: content.substring(0, 200) + '...',
      url,
      source: source || { name: 'Manual', url: '#', logo: undefined },
      category: {
        _id: category || 'general',
        name: 'Общее',
        slug: category || 'general',
        description: '',
        icon: '📰',
        color: '#3b82f6',
        isActive: true,
        rssSources: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      tags: [],
      publishedAt: new Date().toISOString(),
      author: 'User',
      image: '',
      sentiment: 'neutral' as const,
      importance: 5,
      isMonitored: false,
      readingTime: Math.ceil(content.length / 200),
      monitoredBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: newArticle,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
} 