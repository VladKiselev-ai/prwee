import { NextRequest, NextResponse } from 'next/server';

// Временные данные для демонстрации
const mockCategories = [
  {
    _id: 'politics',
    name: 'Политика',
    slug: 'politics',
    description: 'Новости политики, государственной власти и общественной жизни',
    icon: '🏛️',
    color: '#ef4444',
    parentCategory: null,
    isActive: true,
    rssSources: ['РИА Новости', 'ТАСС', 'Интерфакс'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'economy',
    name: 'Экономика',
    slug: 'economy',
    description: 'Новости экономики, бизнеса и финансов',
    icon: '💰',
    color: '#10b981',
    parentCategory: null,
    isActive: true,
    rssSources: ['Коммерсантъ', 'РБК', 'Ведомости'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'technology',
    name: 'Технологии',
    slug: 'technology',
    description: 'Новости технологий, IT и инноваций',
    icon: '💻',
    color: '#3b82f6',
    parentCategory: null,
    isActive: true,
    rssSources: ['3DNews', 'IXBT', 'Хабрахабр', 'CNews'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'sports',
    name: 'Спорт',
    slug: 'sports',
    description: 'Новости спорта и спортивных событий',
    icon: '⚽',
    color: '#8b5cf6',
    parentCategory: null,
    isActive: true,
    rssSources: ['Спорт-Экспресс', 'Советский спорт', 'Чемпионат'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'science',
    name: 'Наука',
    slug: 'science',
    description: 'Новости науки, исследований и открытий',
    icon: '🔬',
    color: '#06b6d4',
    parentCategory: null,
    isActive: true,
    rssSources: ['N+1', 'Элементы', 'Indicator'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'cryptocurrency',
    name: 'Криптовалюты',
    slug: 'cryptocurrency',
    description: 'Новости криптовалют, блокчейна и цифровых активов',
    icon: '₿',
    color: '#f59e0b',
    parentCategory: null,
    isActive: true,
    rssSources: ['ForkLog', 'Bits.media', 'CoinSpot'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'general',
    name: 'Общие новости',
    slug: 'general',
    description: 'Общие новости и события',
    icon: '📰',
    color: '#6b7280',
    parentCategory: null,
    isActive: true,
    rssSources: ['Лента.ру', 'Газета.ру', 'Известия'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    let categories = mockCategories;
    
    if (parentId) {
      categories = categories.filter(cat => cat.parentCategory === parentId);
    } else if (!includeInactive) {
      categories = categories.filter(cat => cat.isActive);
    }
    
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, color, parentCategory, rssSources } = body;
    
    if (!name || !slug || !description) {
      return NextResponse.json(
        { success: false, error: 'Name, slug and description are required' },
        { status: 400 }
      );
    }
    
    const existingCategory = mockCategories.find(cat => cat.name === name || cat.slug === slug);
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name or slug already exists' },
        { status: 409 }
      );
    }
    
    const newCategory = {
      _id: Date.now().toString(),
      name,
      slug,
      description,
      icon: icon || '📰',
      color: color || '#3b82f6',
      parentCategory: parentCategory || null,
      isActive: true,
      rssSources: rssSources || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockCategories.push(newCategory);
    
    return NextResponse.json({
      success: true,
      data: newCategory,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 