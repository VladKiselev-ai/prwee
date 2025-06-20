import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles, type = 'digest' } = body;

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Telegram bot token not found',
          message: 'Добавьте TELEGRAM_BOT_TOKEN в .env.local'
        },
        { status: 400 }
      );
    }

    const chatId = '594250971'; // Новый chatId
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

    let message = '';

    if (type === 'digest') {
      // Ежедневный дайджест
      const categories = Array.from(new Set(articles.map((article: any) => article.category?.name || 'Общее')));
      const importantArticles = articles.filter((article: any) => article.importance >= 7);
      const avgImportance = articles.reduce((sum: number, article: any) => sum + article.importance, 0) / articles.length;

      message = `
📰 <b>Ежедневный дайджест новостей</b>

📊 <b>Статистика:</b>
• Всего статей: ${articles.length}
• Важных: ${importantArticles.length}
• Категорий: ${categories.length}
• Средняя важность: ${avgImportance.toFixed(1)}/10

📋 <b>Категории:</b>
${categories.map(cat => `• ${cat}`).join('\n')}

🔥 <b>Важные новости:</b>
${importantArticles.slice(0, 3).map((article: any, index: number) => 
  `${index + 1}. <a href="${article.url}">${article.title}</a>`
).join('\n')}

⏰ Следующий дайджест завтра в 9:00
      `;
    } else if (type === 'important') {
      // Уведомление о важной новости
      const article = articles[0];
      const sentimentEmoji = article.sentiment === 'positive' ? '😊' : 
                            article.sentiment === 'negative' ? '😔' : '😐';

      message = `
🚨 <b>ВАЖНАЯ НОВОСТЬ</b>

📱 <b>${article.title}</b>

💡 <b>Краткое описание:</b> ${article.summary || article.content.substring(0, 150)}...

⭐ <b>Важность:</b> ${article.importance}/10
${sentimentEmoji} <b>Настроение:</b> ${article.sentiment === 'positive' ? 'Позитивное' : 
                                      article.sentiment === 'negative' ? 'Негативное' : 'Нейтральное'}

📰 <b>Источник:</b> ${article.source.name}
📅 <b>Дата:</b> ${new Date(article.publishedAt).toLocaleDateString('ru-RU')}

🔗 <a href="${article.url}">Читать полную статью</a>
      `;
    } else {
      // Общее уведомление
      message = `
📢 <b>Новые новости</b>

${articles.slice(0, 5).map((article: any, index: number) => 
  `${index + 1}. <a href="${article.url}">${article.title}</a> (⭐${article.importance}/10)`
).join('\n')}

📊 Всего новых статей: ${articles.length}
      `;
    }

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    
    return NextResponse.json({
      success: true,
      data: {
        chatId,
        type,
        articlesCount: articles.length,
        sentAt: new Date().toISOString()
      },
      message: 'Telegram уведомление отправлено успешно!'
    });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Проверьте правильность токена бота и chatId'
      },
      { status: 500 }
    );
  }
} 