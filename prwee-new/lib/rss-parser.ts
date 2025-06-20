import Parser from 'rss-parser';
import dbConnect from './database';
import Article from '@/models/Article';
import Category from '@/models/Category';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['dc:creator', 'author'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export interface RSSItem {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  isoDate: string;
  author?: string;
  media?: any;
  thumbnail?: any;
  contentEncoded?: string;
}

export interface RSSSource {
  name: string;
  url: string;
  categoryId: string;
}

export async function parseRSSFeed(source: RSSSource): Promise<RSSItem[]> {
  try {
    console.log(`Parsing RSS feed: ${source.name} (${source.url})`);
    
    const feed = await parser.parseURL(source.url);
    const items: RSSItem[] = [];
    
    for (const item of feed.items) {
      if (item.title && item.link) {
        items.push({
          title: item.title,
          link: item.link,
          content: item.content || item.contentSnippet || '',
          contentSnippet: item.contentSnippet || '',
          isoDate: item.isoDate || new Date().toISOString(),
          author: item.creator || item.author || '',
          media: item.media,
          thumbnail: item.thumbnail,
          contentEncoded: item.contentEncoded,
        });
      }
    }
    
    console.log(`Parsed ${items.length} items from ${source.name}`);
    return items;
  } catch (error) {
    console.error(`Error parsing RSS feed ${source.name}:`, error);
    return [];
  }
}

export async function saveArticlesFromRSS(items: RSSItem[], source: RSSSource): Promise<number> {
  try {
    await dbConnect();
    
    let savedCount = 0;
    
    for (const item of items) {
      // Проверяем, не существует ли уже статья с таким URL
      const existingArticle = await Article.findOne({ url: item.link });
      if (existingArticle) {
        continue;
      }
      
      // Извлекаем изображение из медиа-контента
      let image = '';
      if (item.media && item.media.$ && item.media.$.url) {
        image = item.media.$.url;
      } else if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) {
        image = item.thumbnail.$.url;
      }
      
      // Очищаем контент от HTML тегов для создания краткого описания
      const cleanContent = item.content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 500);
      
      // Определяем важность статьи на основе ключевых слов
      const importance = calculateArticleImportance(item.title, cleanContent);
      
      // Определяем настроение статьи
      const sentiment = analyzeSentiment(item.title, cleanContent);
      
      // Создаем новую статью
      const article = new Article({
        title: item.title,
        content: item.content || item.contentSnippet || '',
        summary: cleanContent,
        url: item.link,
        source: {
          name: source.name,
          url: source.url,
        },
        category: source.categoryId,
        author: item.author || '',
        publishedAt: new Date(item.isoDate),
        image,
        readingTime: Math.ceil((item.content?.length || 0) / 200), // Примерное время чтения
        importance,
        sentiment,
        tags: extractTags(item.title, cleanContent),
      });
      
      await article.save();
      savedCount++;
    }
    
    console.log(`Saved ${savedCount} new articles from ${source.name}`);
    return savedCount;
  } catch (error) {
    console.error('Error saving articles from RSS:', error);
    return 0;
  }
}

function calculateArticleImportance(title: string, content: string): number {
  const text = `${title} ${content}`.toLowerCase();
  
  // Ключевые слова для определения важности
  const importantKeywords = [
    'важно', 'срочно', 'эксклюзив', 'breaking', 'urgent', 'critical',
    'кризис', 'критический', 'аварийный', 'чрезвычайный'
  ];
  
  const mediumKeywords = [
    'новость', 'обновление', 'изменение', 'развитие', 'прогресс',
    'news', 'update', 'change', 'development'
  ];
  
  let score = 5; // Базовая важность
  
  // Проверяем важные ключевые слова
  for (const keyword of importantKeywords) {
    if (text.includes(keyword)) {
      score += 3;
    }
  }
  
  // Проверяем средние ключевые слова
  for (const keyword of mediumKeywords) {
    if (text.includes(keyword)) {
      score += 1;
    }
  }
  
  // Ограничиваем значение от 1 до 10
  return Math.max(1, Math.min(10, score));
}

function analyzeSentiment(title: string, content: string): 'positive' | 'negative' | 'neutral' {
  const text = `${title} ${content}`.toLowerCase();
  
  const positiveWords = [
    'успех', 'рост', 'развитие', 'прогресс', 'достижение', 'победа',
    'success', 'growth', 'development', 'achievement', 'win'
  ];
  
  const negativeWords = [
    'проблема', 'кризис', 'падение', 'потеря', 'неудача', 'конфликт',
    'problem', 'crisis', 'fall', 'loss', 'failure', 'conflict'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (text.includes(word)) {
      positiveCount++;
    }
  }
  
  for (const word of negativeWords) {
    if (text.includes(word)) {
      negativeCount++;
    }
  }
  
  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

function extractTags(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];
  
  // Простая система извлечения тегов на основе ключевых слов
  const tagKeywords = {
    'технологии': ['технология', 'технологии', 'it', 'программирование', 'разработка'],
    'политика': ['политика', 'правительство', 'президент', 'парламент'],
    'экономика': ['экономика', 'финансы', 'бизнес', 'рынок', 'акции'],
    'спорт': ['спорт', 'футбол', 'баскетбол', 'олимпиада'],
    'наука': ['наука', 'исследование', 'открытие', 'ученые'],
  };
  
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword) && !tags.includes(tag)) {
        tags.push(tag);
        break;
      }
    }
  }
  
  return tags;
}

export async function updateAllRSSFeeds(): Promise<void> {
  try {
    await dbConnect();
    
    // Получаем все активные категории с RSS источниками
    const categories = await Category.find({
      isActive: true,
      'rssSources.0': { $exists: true },
    });
    
    let totalSaved = 0;
    
    for (const category of categories) {
      for (const rssSource of category.rssSources) {
        if (rssSource.isActive) {
          const items = await parseRSSFeed({
            name: rssSource.name,
            url: rssSource.url,
            categoryId: category._id.toString(),
          });
          
          const savedCount = await saveArticlesFromRSS(items, {
            name: rssSource.name,
            url: rssSource.url,
            categoryId: category._id.toString(),
          });
          
          totalSaved += savedCount;
        }
      }
    }
    
    console.log(`RSS update completed. Total new articles saved: ${totalSaved}`);
  } catch (error) {
    console.error('Error updating RSS feeds:', error);
  }
} 