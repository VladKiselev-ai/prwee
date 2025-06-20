export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parentCategory?: Category;
  isActive: boolean;
  rssSources: RSSSource[];
  createdAt: string;
  updatedAt: string;
}

export interface RSSSource {
  name: string;
  url: string;
  isActive: boolean;
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  summary: string;
  url: string;
  source: {
    name: string;
    url: string;
    logo?: string;
  };
  category: Category;
  tags: string[];
  publishedAt: string;
  image: string;
  author: string;
  readingTime: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  importance: number;
  isMonitored: boolean;
  monitoredBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar: string;
  preferences: {
    categories: string[];
    notificationSettings: {
      email: boolean;
      telegram: boolean;
      telegramChatId?: string;
      digestFrequency: 'daily' | 'weekly' | 'never';
    };
    theme: 'light' | 'dark' | 'auto';
  };
  monitoredArticles: MonitoredArticle[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoredArticle {
  article: Article;
  addedAt: string;
  notes?: string;
}

export interface Digest {
  category: Category;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: string;
  stats: {
    totalArticles: number;
    importantArticles: number;
    regularArticles: number;
    sources: string[];
    averageImportance: string;
  };
  articles: {
    important: Article[];
    regular: Article[];
  };
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
} 