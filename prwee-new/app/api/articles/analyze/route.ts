import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, includeContext = true } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DeepSeek API key not found',
          message: 'Добавьте OPENAI_API_KEY в .env.local'
        },
        { status: 400 }
      );
    }

    // Получаем статью из API
    const articlesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/articles`);
    const articlesData = await articlesResponse.json();
    
    if (!articlesData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch articles',
          message: 'Не удалось получить статьи'
        },
        { status: 500 }
      );
    }

    // Находим статью по ID или берем первую
    const article = articleId 
      ? articlesData.data.find((a: any) => a._id === articleId)
      : articlesData.data[0];

    if (!article) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found',
          message: 'Статья не найдена'
        },
        { status: 404 }
      );
    }

    // Инициализируем DeepSeek клиент
    const deepseek = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.deepseek.com', // DeepSeek API endpoint
    });

    // Формируем промпт для анализа
    const analysisPrompt = `
Проанализируй следующую новостную статью и предоставь детальный анализ:

ЗАГОЛОВОК: ${article.title}
СОДЕРЖАНИЕ: ${article.content}
ИСТОЧНИК: ${article.source.name}
КАТЕГОРИЯ: ${article.category?.name || 'Общее'}
ДАТА: ${new Date(article.publishedAt).toLocaleDateString('ru-RU')}

Пожалуйста, предоставь анализ в следующем формате:

## 📊 АНАЛИЗ СТАТЬИ

### 🎯 Основная суть
Краткое описание главной новости (2-3 предложения)

### ⭐ Важность события
Оценка важности по шкале 1-10 с объяснением

### 😊 Настроение и тон
Анализ настроения (позитивное/негативное/нейтральное) с примерами

### 🔍 Ключевые факты
- 3-5 самых важных фактов из статьи
- Конкретные цифры, даты, имена

### 🌍 Влияние и последствия
Как это событие может повлиять на:
- Отрасль/сферу
- Общество
- Экономику (если применимо)

### 🎪 Интересные детали
Любопытные факты или неожиданные аспекты

${includeContext ? `
## 📚 ПРЕДЫСТОРИЯ И КОНТЕКСТ

### 🕰️ Исторический контекст
Расскажи о предыстории этого события/темы:
- Что происходило раньше
- Ключевые события в прошлом
- Как мы к этому пришли

### 👥 Ключевые участники
- Кто главные действующие лица
- Их роль и значение
- Предыдущие действия/заявления

### 📈 Тренды и паттерны
- Какие тренды прослеживаются
- Повторяющиеся паттерны
- Связи с другими событиями

### 🔗 Связи с другими темами
Как это событие связано с:
- Другими новостями
- Глобальными процессами
- Социальными явлениями
` : ''}

## 💡 ВЫВОДЫ И ПЕРСПЕКТИВЫ

### 🎯 Что это значит
Основные выводы и значение события

### 🔮 Что дальше
Возможные сценарии развития событий

### 🤔 Вопросы для размышления
3-5 вопросов, которые стоит задать себе

---

Анализ должен быть информативным, но доступным для понимания. Используй эмодзи для лучшей структуризации.
`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat", // DeepSeek модель
      messages: [
        {
          role: "system",
          content: "Ты эксперт-аналитик новостей. Твоя задача - предоставить глубокий анализ новостных статей с контекстом и предысторией. Будь объективным, информативным и доступным в изложении."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;

    // Дополнительный анализ для извлечения структурированных данных
    const structuredPrompt = `
Извлеки из следующего анализа структурированные данные в формате JSON:

${analysis}

Верни только JSON с полями:
{
  "summary": "краткое описание",
  "importance": число от 1 до 10,
  "sentiment": "positive/negative/neutral",
  "keyFacts": ["факт1", "факт2", "факт3"],
  "impact": "влияние на отрасль/общество",
  "context": "предыстория события",
  "keyPlayers": ["участник1", "участник2"],
  "trends": ["тренд1", "тренд2"],
  "conclusions": "основные выводы",
  "nextSteps": "что дальше"
}
`;

    const structuredCompletion = await deepseek.chat.completions.create({
      model: "deepseek-chat", // DeepSeek модель
      messages: [
        {
          role: "system",
          content: "Ты помощник для извлечения структурированных данных. Возвращай только валидный JSON."
        },
        {
          role: "user",
          content: structuredPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    let structuredData;
    try {
      structuredData = JSON.parse(structuredCompletion.choices[0].message.content || '{}');
    } catch (error) {
      structuredData = {
        summary: "Анализ выполнен",
        importance: 7,
        sentiment: "neutral",
        keyFacts: [],
        impact: "Требует дополнительного анализа",
        context: "Контекст предоставлен в полном анализе",
        keyPlayers: [],
        trends: [],
        conclusions: "См. полный анализ выше",
        nextSteps: "Мониторинг развития событий"
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        article: {
          id: article._id,
          title: article.title,
          source: article.source.name,
          category: article.category?.name,
          publishedAt: article.publishedAt
        },
        analysis: {
          full: analysis,
          structured: structuredData
        },
        metadata: {
          model: "deepseek-chat",
          tokens: completion.usage?.total_tokens || 0,
          includeContext,
          analyzedAt: new Date().toISOString()
        }
      },
      message: 'AI-анализ статьи выполнен успешно с DeepSeek!'
    });

  } catch (error) {
    console.error('Error analyzing article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Ошибка при выполнении AI-анализа'
      },
      { status: 500 }
    );
  }
} 