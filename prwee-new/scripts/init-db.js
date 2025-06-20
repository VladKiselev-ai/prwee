const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-aggregator';

// Схемы (упрощенные для скрипта)
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  icon: String,
  color: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  rssSources: [{
    name: String,
    url: String,
    isActive: { type: Boolean, default: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

// Примеры категорий
const categories = [
  {
    name: 'Технологии',
    slug: 'technology',
    description: 'Новости из мира технологий, IT и инноваций',
    icon: '💻',
    color: '#3b82f6',
    rssSources: [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        isActive: true
      },
      {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        isActive: true
      },
      {
        name: 'Wired',
        url: 'https://www.wired.com/feed/rss',
        isActive: true
      }
    ]
  },
  {
    name: 'Политика',
    slug: 'politics',
    description: 'Политические новости и события',
    icon: '🏛️',
    color: '#dc2626',
    rssSources: [
      {
        name: 'BBC Politics',
        url: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
        isActive: true
      },
      {
        name: 'Reuters Politics',
        url: 'https://feeds.reuters.com/Reuters/PoliticsNews',
        isActive: true
      }
    ]
  },
  {
    name: 'Экономика',
    slug: 'economy',
    description: 'Экономические новости и финансовые рынки',
    icon: '💰',
    color: '#059669',
    rssSources: [
      {
        name: 'Financial Times',
        url: 'https://www.ft.com/rss/home',
        isActive: true
      },
      {
        name: 'Bloomberg',
        url: 'https://feeds.bloomberg.com/markets/news.rss',
        isActive: true
      }
    ]
  },
  {
    name: 'Криптовалюты',
    slug: 'cryptocurrency',
    description: 'Новости о криптовалютах и блокчейне',
    icon: '₿',
    color: '#f59e0b',
    rssSources: [
      {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        isActive: true
      },
      {
        name: 'Cointelegraph',
        url: 'https://cointelegraph.com/rss',
        isActive: true
      }
    ]
  },
  {
    name: 'Спорт',
    slug: 'sports',
    description: 'Спортивные новости и результаты',
    icon: '⚽',
    color: '#7c3aed',
    rssSources: [
      {
        name: 'ESPN',
        url: 'https://www.espn.com/espn/rss/news',
        isActive: true
      },
      {
        name: 'BBC Sport',
        url: 'https://feeds.bbci.co.uk/sport/rss.xml',
        isActive: true
      }
    ]
  },
  {
    name: 'Наука',
    slug: 'science',
    description: 'Научные открытия и исследования',
    icon: '🔬',
    color: '#0891b2',
    rssSources: [
      {
        name: 'Nature',
        url: 'https://www.nature.com/nature.rss',
        isActive: true
      },
      {
        name: 'Science',
        url: 'https://www.science.org/rss/news_current.xml',
        isActive: true
      }
    ]
  },
  {
    name: 'Здоровье',
    slug: 'health',
    description: 'Новости медицины и здравоохранения',
    icon: '🏥',
    color: '#dc2626',
    rssSources: [
      {
        name: 'Medical News Today',
        url: 'https://www.medicalnewstoday.com/newsfeeds-rss.xml',
        isActive: true
      },
      {
        name: 'Healthline',
        url: 'https://www.healthline.com/rss/medical',
        isActive: true
      }
    ]
  },
  {
    name: 'Развлечения',
    slug: 'entertainment',
    description: 'Новости кино, музыки и развлечений',
    icon: '🎬',
    color: '#ec4899',
    rssSources: [
      {
        name: 'Variety',
        url: 'https://variety.com/feed',
        isActive: true
      },
      {
        name: 'The Hollywood Reporter',
        url: 'https://www.hollywoodreporter.com/feed',
        isActive: true
      }
    ]
  }
];

// Подкатегории
const subcategories = [
  {
    name: 'Искусственный интеллект',
    slug: 'artificial-intelligence',
    description: 'Новости о развитии ИИ и машинного обучения',
    icon: '🤖',
    color: '#8b5cf6',
    parentSlug: 'technology',
    rssSources: [
      {
        name: 'AI News',
        url: 'https://artificialintelligence-news.com/feed/',
        isActive: true
      }
    ]
  },
  {
    name: 'Кибербезопасность',
    slug: 'cybersecurity',
    description: 'Новости о безопасности в цифровом мире',
    icon: '🔒',
    color: '#ef4444',
    parentSlug: 'technology',
    rssSources: [
      {
        name: 'Security Week',
        url: 'https://www.securityweek.com/feed/',
        isActive: true
      }
    ]
  },
  {
    name: 'DeFi',
    slug: 'defi',
    description: 'Децентрализованные финансы',
    icon: '🏦',
    color: '#10b981',
    parentSlug: 'cryptocurrency',
    rssSources: [
      {
        name: 'DeFi Pulse',
        url: 'https://defipulse.com/blog/feed/',
        isActive: true
      }
    ]
  }
];

async function initDatabase() {
  try {
    console.log('Подключение к MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключение к MongoDB установлено');

    // Очищаем существующие категории
    console.log('Очистка существующих категорий...');
    await Category.deleteMany({});
    console.log('✅ Существующие категории удалены');

    // Создаем основные категории
    console.log('Создание основных категорий...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Создано ${createdCategories.length} основных категорий`);

    // Создаем подкатегории
    console.log('Создание подкатегорий...');
    for (const subcategory of subcategories) {
      const parentCategory = createdCategories.find(cat => cat.slug === subcategory.parentSlug);
      if (parentCategory) {
        await Category.create({
          ...subcategory,
          parentCategory: parentCategory._id
        });
      }
    }
    console.log(`✅ Создано ${subcategories.length} подкатегорий`);

    // Выводим статистику
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const categoriesWithRSS = await Category.countDocuments({ 'rssSources.0': { $exists: true } });

    console.log('\n📊 Статистика базы данных:');
    console.log(`Всего категорий: ${totalCategories}`);
    console.log(`Активных категорий: ${activeCategories}`);
    console.log(`Категорий с RSS: ${categoriesWithRSS}`);

    console.log('\n🎉 Инициализация базы данных завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Соединение с MongoDB закрыто');
  }
}

// Запуск скрипта
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 