import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, message } = body;

    if (!chatId || !message) {
      return NextResponse.json(
        { success: false, error: 'ChatId and message are required' },
        { status: 400 }
      );
    }

    console.log('Тестируем Telegram уведомления...');
    
    // Проверяем наличие Telegram токена
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

    // Создаем бота
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

    // Отправляем тестовое сообщение
    const testMessage = `
🤖 <b>Тестовое сообщение от новостного агрегатора</b>

${message}

📅 Отправлено: ${new Date().toLocaleString('ru-RU')}
    `;

    await bot.sendMessage(chatId, testMessage, { parse_mode: 'HTML' });
    
    return NextResponse.json({
      success: true,
      data: {
        chatId,
        message: testMessage,
        sentAt: new Date().toISOString()
      },
      message: 'Telegram сообщение отправлено успешно!'
    });
  } catch (error) {
    console.error('Error testing Telegram:', error);
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